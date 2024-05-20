import os
import subprocess
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

def run_command(command):
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        stdout, stderr = process.communicate()
        if process.returncode != 0:
            print(f"Error: {stderr.decode()}")
            sys.exit(process.returncode)
        else:
            print(stdout.decode())
        return stdout
    except subprocess.CalledProcessError as e:
        print(f"Failed to execute command: {command}\n{e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred when executing command: {command}\n{e}")
        sys.exit(1)

for env_var in ['SERVER_IP', 'DATABASE_URL', 'MODEL_PATH', 'SERVER_HEALTH_ENDPOINT']:
    if os.getenv(env_var) is None:
        print(f"Error: {env_var} is not set. Please check your .env file.")
        sys.exit(1)

SERVER_IP = os.getenv('SERVER_IP')
DATABASE_URL = os.getenv('DATABASE_URL')
MODEL_PATH = os.getenv('MODEL_PATH')
SERVER_HEALTH_ENDPOINT = os.getenv('SERVER_HEALTH_ENDPOINT', "http://your_server_health_endpoint")

def deploy_server():
    print("\nDeploying server...")
    run_command(f"ssh root@{SERVER_IP} 'docker-compose up -d'")

def check_server_health():
    print("\nChecking server health...")
    try:
        response = requests.get(SERVER_HEALTH_ENDPOINT)
        if response.status_code == 200 and response.json().get("status") == "UP":
            print("Server is up and running!")
        else:
            print(f"Server health check failed with status code: {response.status_code}")
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Error checking server health: {e}")
        sys.exit(1)

def setup_database():
    print("\nSetting up database...")
    run_command(f"ssh root@{SERVER_IP} 'docker exec my-database-container sh -c \"php artisan migrate\"'")

def deploy_ml_model():
    print("\nDeploying machine learning model...")
    if not os.path.exists(MODEL_PATH):
        print("Error: The specified MODEL_PATH does not exist.")
        sys.exit(1)
    run_command(f"scp {MODEL_PATH} root@{SERVER_IP}:/path/to/your/model/directory")

def output_logs():
    print("\nOutputting logs...")
    run_command(f"ssh root@{SERVER_IP} 'docker-compose logs -f your_service_name'")

def main():
    deploy_server()
    check_server_health()
    setup_database()
    deploy_ml_model()
    output_logs()
    print("\nDeployment process completed successfully!")

if __name__ == "__main__":
    main()