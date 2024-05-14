import os
import subprocess
import sys
from dotenv import load_dotenv
load_dotenv()

def run_command(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = process.communicate()
    if process.returncode != 0:
        print(f"Error: {stderr}")
        sys.exit(process.returncode)
    else:
        print(stdout)
    return stdout

SERVER_IP = os.getenv('SERVER_IP')
DATABASE_URL = os.getenv('DATABASE_URL')
MODEL_PATH = os.getenv('MODEL_PATH')

def deploy_server():
    print("\nDeploying server...")
    run_command(f"ssh root@{SERVER_IP} 'docker-compose up -d'")

def setup_database():
    print("\nSetting up database...")
    run_command(f"ssh root@{SERVER_IP} 'docker exec my-database-container sh -c \"php artisan migrate\"'")

def deploy_ml_model():
    print("\nDeploying machine learning model...")
    run_command(f"scp {MODEL_PATH} root@{SERVER_IP}:/path/to/your/model/directory")

def main():
    deploy_server()
    setup_database()
    deploy_ml_model()
    print("\nDeployment process completed successfully!")

if __name__ == "__main__":
    main()