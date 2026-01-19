# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Edgar Pecson Portfolio Backend")

# CORS – allow React frontend (restrict in production!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite dev
        "http://localhost:3000",    # CRA if used
        "*"                         # ← change to your real domain in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS clients
ec2 = boto3.client(
    'ec2',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-west-1")
)

ssm = boto3.client(
    'ssm',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-west-1")
)

INSTANCE_ID = os.getenv("EC2_INSTANCE_ID")

# Safe console commands that will run on the EC2 instance via SSM
ALLOWED_COMMANDS = {
    "df":        "df -h",
    "uptime":    "uptime",
    "free":      "free -h",
    "top":       "top -b -n 1 | head -15",
    "ls_home":   "ls -lh /home/oracle",
    "ls_u01":    "ls -lh /u01/app/oracle",
}

# ────────────────────────────────────────────────
# 1. RMAN Backup Demo (local simulation)
# ────────────────────────────────────────────────
@app.get("/api/rman-backup")
async def rman_backup():
    return {"message": "RMAN backup started! (Simulated) Check logs for progress."}

# ────────────────────────────────────────────────
# 2. EC2 Control Endpoints
# ────────────────────────────────────────────────
@app.get("/ec2-status")
async def get_ec2_status():
    try:
        response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = response['Reservations'][0]['Instances'][0]['State']['Name']
        return {"status": state}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/start-ec2")
async def start_ec2():
    try:
        response = ec2.start_instances(InstanceIds=[INSTANCE_ID])
        return {
            "message": "Start command sent",
            "aws_response": {
                "StartingInstances": response.get("StartingInstances", []),
                "RequestId": response.get("ResponseMetadata", {}).get("RequestId")
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/stop-ec2")
async def stop_ec2():
    try:
        response = ec2.stop_instances(InstanceIds=[INSTANCE_ID])
        return {
            "message": "Stop command sent",
            "aws_response": {
                "StoppingInstances": response.get("StoppingInstances", []),
                "RequestId": response.get("ResponseMetadata", {}).get("RequestId")
            }
        }
    except Exception as e:
        return {"error": str(e)}

# ────────────────────────────────────────────────
# 3. Console Commands – Run ON THE EC2 INSTANCE via SSM Run Command
# ────────────────────────────────────────────────
@app.get("/console/{cmd_key}")
async def run_console_command(cmd_key: str):
    if cmd_key not in ALLOWED_COMMANDS:
        return {"error": f"Command not allowed. Allowed: {', '.join(ALLOWED_COMMANDS.keys())}"}

    cmd = ALLOWED_COMMANDS[cmd_key]

    try:
        # Check instance state
        ec2_response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = ec2_response['Reservations'][0]['Instances'][0]['State']['Name']

        if state != 'running':
            return {
                "status": "down",
                "message": f"Instance is {state} – console commands unavailable"
            }

        # Send SSM command
        print(f"[SSM] Sending command '{cmd}' to {INSTANCE_ID}")
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName="AWS-RunShellScript",
            Parameters={"commands": [cmd]},
            TimeoutSeconds=90,
            Comment="Portfolio console demo",
            MaxConcurrency="1",
            MaxErrors="0"
        )

        command_id = response['Command']['CommandId']
        print(f"[SSM] Command ID: {command_id}")

        # Poll for completion
        invocation = None
        for attempt in range(40):
            try:
                invocation = ssm.get_command_invocation(
                    CommandId=command_id,
                    InstanceId=INSTANCE_ID,
                    PluginName="aws:runShellScript"   # FIXED HERE
                )
                status = invocation['Status']
                print(f"[SSM] Attempt {attempt+1}: Status = {status}")

                if status in ['Success', 'Failed', 'TimedOut', 'Cancelled', 'DeliveryTimedOut']:
                    break

            except ssm.exceptions.InvocationDoesNotExist:
                print("[SSM] Invocation not yet created – waiting...")
                await asyncio.sleep(5)
                continue

            except Exception as poll_err:
                print(f"[SSM] Poll error: {str(poll_err)}")
                await asyncio.sleep(5)
                continue

            await asyncio.sleep(3)

        if invocation is None:
            return {"error": "Command invocation never appeared (SSM delivery timeout)"}

        if invocation['Status'] == 'Success':
            return {
                "command": cmd,
                "output": invocation.get('StandardOutputContent', '').strip(),
                "error": invocation.get('StandardErrorContent', '').strip() or None,
                "status": "success"
            }
        else:
            return {
                "status": "error",
                "message": f"Command {invocation['Status']}: {invocation.get('ResponseCode', 'N/A')}",
                "error": invocation.get('StandardErrorContent', '').strip()
            }

    except Exception as e:
        error_str = str(e).lower()
        print(f"[SSM] Exception: {error_str}")
        if "not running" in error_str or "stopped" in error_str or "invalidinstanceid" in error_str:
            return {
                "status": "down",
                "message": "Instance is down or unavailable"
            }
        return {"error": error_str}
# ────────────────────────────────────────────────
# Root endpoint – for testing
# ────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "FastAPI backend is running",
        "ec2_instance_id": INSTANCE_ID or "not set",
        "region": os.getenv("AWS_REGION", "not set")
    }