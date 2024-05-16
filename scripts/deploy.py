import os
import subprocess
import sys
import requests
from dotenv import load_dotenv
load_dotenv()

def run_command(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = process.communicate()
    if process.returncode != 0:
        print(f"Error: {stderr.decode()}")
        sys.exit(process.returncode)
    else:
        print(stdout.decode())
    return stdout

SERVER_IP = os.getenv('SERVER_IP')
DATABASE_URL = os.getenv('DATABASE_URL')
MODEL_PATH = os.getenv('MODEL_PATH')
SERVER_HEALTH_ENDPOINT = os.getenv('SERVER_HEALTH_ENDPOINT', "http://your_server_health_endpoint")  # Adjust as per your health-check URL

def deploy_server():
    print("\nDeploying server...")
    run_command(f"ssh root@{SERVER_IP} 'docker-compose up -d'")

def check_server_health():
    print("\nChecking server health...")
    try:
        response = requests.get(SERVER_HEALTH_ENDPOINT)
        if response.status_code == 200:
            print("Server is up and running!")
        else:
            print(f"Server health check failed with status code: {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"Error checking server health: {e}")
        sys.exit(1)

def setup_database():
    print("\nSetting up database...")
    run_command(f"ssh root@{SERVER_IP} 'docker exec my-database-container sh -c \"php artisan migrate\"'")

def deploy_ml_model():
    print("\nDeploying machine learning model...")
    run_command(f"scp {MODEL_PATH} root@{SERVER_IP}:/path/to/your/model/directory")

def main():
    deploy_server()
    check_server_health()
    setup_database()
    deploy_ml_model()
    print("\nDeployment process completed successfully!")

if __name__ == "__main__":
    main()