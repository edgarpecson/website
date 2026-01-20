# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import asyncio

app = FastAPI(title="Edgar Pecson Portfolio Backend")

# ==================== CORS ====================
# IMPORTANT: Update this after deployment
allowed_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://localhost:3000"   # Vite + CRA dev
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== AWS Clients ====================
# Do NOT hardcode keys! Use IAM Role (Amplify will provide this automatically)
ec2 = boto3.client('ec2', region_name=os.getenv("AWS_REGION", "us-west-1"))
ssm = boto3.client('ssm', region_name=os.getenv("AWS_REGION", "us-west-1"))

INSTANCE_ID = os.getenv("EC2_INSTANCE_ID")

# Safe allowed commands
ALLOWED_COMMANDS = {
    "df":        "df -h",
    "uptime":    "uptime",
    "free":      "free -h",
    "top":       "top -b -n 1 | head -15",
    "ls_home":   "ls -lh /home/oracle",
    "ls_u01":    "ls -lh /u01/app/oracle",
}

# ==================== Routes ====================

@app.get("/")
async def root():
    return {
        "message": "FastAPI backend is running",
        "ec2_instance_id": INSTANCE_ID or "not set",
        "region": os.getenv("AWS_REGION", "not set")
    }

@app.get("/api/rman-backup")
async def rman_backup():
    return {"message": "RMAN backup started! (Simulated)"}

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
        return {"message": "Start command sent", "aws_response": response}
    except Exception as e:
        return {"error": str(e)}

@app.post("/stop-ec2")
async def stop_ec2():
    try:
        response = ec2.stop_instances(InstanceIds=[INSTANCE_ID])
        return {"message": "Stop command sent", "aws_response": response}
    except Exception as e:
        return {"error": str(e)}

@app.get("/console/{cmd_key}")
async def run_console_command(cmd_key: str):
    if cmd_key not in ALLOWED_COMMANDS:
        return {"error": f"Command not allowed. Allowed: {list(ALLOWED_COMMANDS.keys())}"}

    if not INSTANCE_ID:
        return {"error": "EC2_INSTANCE_ID environment variable is not set"}

    cmd = ALLOWED_COMMANDS[cmd_key]

    try:
        # Quick check if instance is running
        instance = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = instance['Reservations'][0]['Instances'][0]['State']['Name']

        if state != "running":
            return {"status": "down", "message": f"Instance is currently {state}"}

        # Send SSM command (non-blocking)
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName="AWS-RunShellScript",
            Parameters={"commands": [cmd]},
            TimeoutSeconds=60,
            Comment="Portfolio console command"
        )

        command_id = response['Command']['CommandId']

        return {
            "status": "sent",
            "command": cmd,
            "command_id": command_id,
            "message": "Command sent successfully. Use /console/result/{command_id} to check output."
        }

    except Exception as e:
        return {"error": str(e)}