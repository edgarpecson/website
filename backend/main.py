from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
import time

load_dotenv()

app = FastAPI(title="Edgar Pecson Portfolio API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-west-1")
INSTANCE_ID = os.getenv("EC2_INSTANCE_ID")
ORACLE_HOME = os.getenv("ORACLE_HOME", "/u01/app/oracle/product/19.0.0/dbhome_1")

ec2 = boto3.client(
    'ec2',
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

ssm = boto3.client(
    'ssm',
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

# YOUR ORIGINAL COMMANDS - Restored!
ALLOWED_COMMANDS = {
    'df': 'df -h',
    'uptime': 'uptime',
    'free': 'free -h',
    'top': 'top -b -n 1 | head -15',
    'start_db': f'sudo su - oracle -c "cat /dev/null > {ORACLE_HOME}/rdbms/log/startup.log && cd \\$ORACLE_HOME/bin && ./dbstart \\$ORACLE_HOME && echo \\"--- Startup Log ---\\" && cat {ORACLE_HOME}/rdbms/log/startup.log | tail -n 50"',
    'shutdown_db': f'sudo su - oracle -c "cat /dev/null > {ORACLE_HOME}/rdbms/log/shutdown.log && cd \\$ORACLE_HOME/bin && ./dbshut \\$ORACLE_HOME && echo \\"--- Shutdown Log ---\\" && cat {ORACLE_HOME}/rdbms/log/shutdown.log | tail -n 50"',
    'db_status': 'sudo su - oracle -c "ps -ef | grep [o]ra_pmon_ | grep -v grep"',
    'view_startup_log': f'sudo su - oracle -c "echo \\"--- Startup Log ---\\" && cat {ORACLE_HOME}/rdbms/log/startup.log | tail -n 50 || echo \\"No log available\\""',
    'view_shutdown_log': f'sudo su - oracle -c "echo \\"--- Shutdown Log ---\\" && cat {ORACLE_HOME}/rdbms/log/shutdown.log | tail -n 50 || echo \\"No log available\\""',
    'listener_status': 'sudo su - oracle -c "lsnrctl status"',
    'rman_demo': f'sudo su - oracle -c "cat {ORACLE_HOME}/rdbms/log/startup.log | tail -n 30 || echo \\"RMAN demo - see startup log\\""'
}


@app.get("/")
async def root():
    return {
        "message": "Edgar Pecson Portfolio API",
        "version": "1.0",
        "status": "operational"
    }


@app.get("/ec2-status")
async def get_ec2_status():
    """Get current EC2 instance status"""
    if not INSTANCE_ID:
        return {"status": "not_configured"}
    
    try:
        response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        state = response['Reservations'][0]['Instances'][0]['State']['Name']
        return {"status": state}
    except ClientError as e:
        return {"status": "error", "message": str(e)}


@app.post("/start-ec2")
async def start_ec2():
    """Start EC2 instance"""
    if not INSTANCE_ID:
        raise HTTPException(status_code=400, detail="EC2 instance not configured")
    
    try:
        ec2.start_instances(InstanceIds=[INSTANCE_ID])
        return {"message": "EC2 instance starting"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop-ec2")
async def stop_ec2():
    """Stop EC2 instance"""
    if not INSTANCE_ID:
        raise HTTPException(status_code=400, detail="EC2 instance not configured")
    
    try:
        ec2.stop_instances(InstanceIds=[INSTANCE_ID])
        return {"message": "EC2 instance stopping"}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/oracle-status")
async def get_oracle_status():
    """Get Oracle database status - YOUR ORIGINAL METHOD"""
    if not INSTANCE_ID:
        return {"status": "not_configured"}
    
    # Check if EC2 is running first
    try:
        ec2_response = ec2.describe_instances(InstanceIds=[INSTANCE_ID])
        ec2_state = ec2_response['Reservations'][0]['Instances'][0]['State']['Name']
        
        if ec2_state != 'running':
            return {"status": "SHUTDOWN", "message": "EC2 not running"}
    except:
        return {"status": "unknown"}
    
    # Check for Oracle PMON process - YOUR ORIGINAL METHOD
    command = ALLOWED_COMMANDS['db_status']
    
    try:
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': [command]}
        )
        
        command_id = response['Command']['CommandId']
        
        # Wait for command
        for _ in range(10):
            time.sleep(0.5)
            result = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=INSTANCE_ID
            )
            
            if result['Status'] in ['Success', 'Failed']:
                break
        
        output = result.get('StandardOutputContent', '').strip()
        
        # If PMON process found, database is running
        if output and 'ora_pmon' in output:
            status = 'OPEN'
        else:
            status = 'SHUTDOWN'
        
        return {"status": status}
    except Exception as e:
        return {"status": "unknown", "message": str(e)}


@app.post("/start-oracle")
async def start_oracle():
    """Start Oracle database - YOUR ORIGINAL METHOD"""
    command = ALLOWED_COMMANDS['start_db']
    
    try:
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': [command]}
        )
        
        command_id = response['Command']['CommandId']
        
        # Wait for result (dbstart can take time)
        for _ in range(30):
            time.sleep(1)
            result = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=INSTANCE_ID
            )
            
            if result['Status'] in ['Success', 'Failed']:
                break
        
        output = result.get('StandardOutputContent', '')
        
        return {
            "message": "Oracle database started",
            "output": output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop-oracle")
async def stop_oracle():
    """Stop Oracle database - YOUR ORIGINAL METHOD"""
    command = ALLOWED_COMMANDS['shutdown_db']
    
    try:
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': [command]}
        )
        
        command_id = response['Command']['CommandId']
        
        # Wait for result (dbshut can take time)
        for _ in range(30):
            time.sleep(1)
            result = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=INSTANCE_ID
            )
            
            if result['Status'] in ['Success', 'Failed']:
                break
        
        output = result.get('StandardOutputContent', '')
        
        return {
            "message": "Oracle database stopped",
            "output": output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/console/{cmd_key}")
async def execute_console_command(cmd_key: str):
    """Execute console command - YOUR ORIGINAL METHOD"""
    if cmd_key not in ALLOWED_COMMANDS:
        raise HTTPException(status_code=400, detail=f"Invalid command: {cmd_key}")
    
    command = ALLOWED_COMMANDS[cmd_key]
    
    try:
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': [command]}
        )
        
        command_id = response['Command']['CommandId']
        
        # Wait for result
        for _ in range(15):
            time.sleep(0.5)
            result = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=INSTANCE_ID
            )
            
            if result['Status'] in ['Success', 'Failed']:
                break
        
        if result['Status'] == 'Success':
            return {
                "output": result['StandardOutputContent'],
                "message": "Command executed successfully"
            }
        else:
            return {
                "output": result['StandardErrorContent'],
                "message": "Command failed"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rman-demo")
async def rman_demo():
    """RMAN backup demo"""
    import random
    
    backup_size = round(random.uniform(50, 500), 2)
    duration = round(random.uniform(5, 30), 2)
    
    output = f"""
RMAN Backup Simulation - Oracle 19c

Starting full database backup at {time.strftime('%Y-%m-%d %H:%M:%S')}
Channel ORA_DISK_1: starting full datafile backup set
Channel ORA_DISK_1: specifying datafile(s) in backup set

Backup Size: {backup_size} GB
Duration: {duration} minutes
Throughput: {round(backup_size / duration * 60, 2)} GB/hour
Compression: 60%

Backup completed successfully
Backup piece: /backup/full_db_{time.strftime('%Y%m%d')}.bkp
Status: AVAILABLE
"""
    
    return {
        "message": "RMAN backup simulation completed",
        "output": output
    }


@app.get("/oracle-listener-status")
async def oracle_listener_status():
    """Check Oracle Listener - YOUR ORIGINAL METHOD"""
    command = ALLOWED_COMMANDS['listener_status']
    
    try:
        response = ssm.send_command(
            InstanceIds=[INSTANCE_ID],
            DocumentName='AWS-RunShellScript',
            Parameters={'commands': [command]}
        )
        
        command_id = response['Command']['CommandId']
        
        # Wait for result
        for _ in range(10):
            time.sleep(0.5)
            result = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=INSTANCE_ID
            )
            
            if result['Status'] in ['Success', 'Failed']:
                break
        
        return {
            "output": result.get('StandardOutputContent', ''),
            "message": "Listener status retrieved"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "aws_configured": bool(INSTANCE_ID)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
