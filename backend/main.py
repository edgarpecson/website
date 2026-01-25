# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()  # Loads .env file (AWS keys, region, instance ID)

app = FastAPI(title="Edgar Pecson Portfolio Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Remove "*"
    allow_credentials=False,  # Set to False (no creds used)
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS clients using env vars
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

# Safe console commands
ALLOWED_COMMANDS = {
    'df': 'df -h',
    'uptime': 'uptime',
    'free': 'free -h',
    'top': 'top -b -n 1 | head -15',
    'ls_home': 'ls -lh /home/oracle',
    'start_db': 'sudo su - oracle -c "cd \\$ORACLE_HOME/bin && ./dbstart \\$ORACLE_HOME"',  # If added
}

# RMAN backup demo endpoint (simulated)
@app.get("/api/rman-backup")
async def rman_backup():
    return {"message": "RMAN backup started! (Simulated) Check logs for progress."}

# EC2 status endpoint
@app.get("/ec2-status")
async def get_ec2_status():
    try:
        response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = response['Reservations'][0]['Instances'][0]['State']['Name']
        return {"status": state}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Start EC2 endpoint
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

# Stop EC2 endpoint
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

# Console command endpoint – runs on EC2 via SSM
@app.get("/console/{cmd_key}")
async def run_console_command(cmd_key: str):
    if cmd_key not in ALLOWED_COMMANDS:
        return {"error": "Command not allowed"}

    cmd = ALLOWED_COMMANDS[cmd_key]

    try:
        ec2_response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = ec2_response['Reservations'][0]['Instances'][0]['State']['Name']

        if state != 'running':
            if state == 'pending':
                return {
                    "status": "down",
                    "message": "Loading EC2 instance status..."
                }
            else:
                message = f"Instance is {state} – console commands unavailable"
                return {
                    "status": "down",
                    "message": message
                }

        # Send command if running
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

        invocation = None
        for _ in range(40):
            try:
                invocation = ssm.get_command_invocation(
                    CommandId=command_id,
                    InstanceId=INSTANCE_ID,
                    PluginName="aws:runShellScript"
                )
                if invocation['Status'] in ['Success', 'Failed', 'TimedOut']:
                    break
            except ssm.exceptions.InvocationDoesNotExist:
                await asyncio.sleep(5)
                continue
            await asyncio.sleep(3)

        if invocation and invocation['Status'] == 'Success':
            return {
                "command": cmd,
                "output": invocation.get('StandardOutputContent', '').strip(),
                "error": invocation.get('StandardErrorContent', '').strip() or None
            }
        else:
            return {"error": "Command did not complete successfully"}

    except Exception as e:
        error_str = str(e).lower()
        if "invalidinstanceid" in error_str or "not running" in error_str or "stopped" in error_str:
            return {"status": "down", "message": "Loading EC2 instance status..."}
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "FastAPI backend is running"}