from datetime import datetime, timedelta
import jwt
from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash
from functools import wraps
import os
import uuid

app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_secret_key_here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(50))
    password = db.Column(db.String(80))
    admin = db.Column(db.Boolean)


class WorkoutLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(public_id=data['public_id']).first()
        except Exception as e:
            return jsonify({'message': f'Token is invalid! Error: {str(e)}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


@app.route('/user', methods=['POST'])
def create_user():
    data = request.get_json()
    try:
        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = User(public_id=str(uuid.uuid4()), name=data['name'], password=hashed_password, admin=False)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'New user created!'})
    except Exception as e:
        return jsonify({'message': f'Failed to create new user. Error: {str(e)}'}), 500


@app.route('/login', methods=['POST'])
def login_user():
    auth = request.authorization
    try:
        if not auth or not auth.username or not auth.password:
            return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
        user = User.query.filter_by(name=auth.username).first()
        if not user:
            return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
        if check_password_hash(user.password, auth.password):
            token = jwt.encode({'public_id': user.public_id, 'exp': datetime.utcnow() + timedelta(minutes=30)}, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({'token': token})
        else:
            return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})
    except Exception as e:
        return jsonify({'message': f'Login error. Error: {str(e)}'}), 500


@app.route('/workout', methods=['POST'])
@token_required
def add_workout(current_user):
    data = request.get_json()
    try:
        new_workout = WorkoutLog(description=data['description'], user_id=current_user.id)
        db.session.add(new_workout)
        db.session.commit()
        return jsonify({'message': 'Workout log created!'})
    except Exception as e:
        return jsonify({'message': f'Failed to create workout log. Error: {str(e)}'}), 500


@app.route('/workout/<user_id>', methods=['GET'])
@token_required
def get_workouts(current_user, user_id):
    try:
        if not current_user.admin:
            return jsonify({'message': 'Cannot perform that function!'})
        workouts = WorkoutLog.query.filter_by(user_id=user_id).all()
        output = [
            {'id': workout.id, 'date': workout.date.strftime('%Y-%m-%d %H:%M'), 'description': workout.description, 'user_id': workout.user_id}
            for workout in workouts
        ]
        return jsonify({'workouts': output})
    except Exception as e:
        return jsonify({'message': f'Failed to retrieve workouts. Error: {str(e)}'}), 500


@app.route('/workoutplan', methods=['POST'])
@token_required
def generate_workout_plan(current_user):
    try:
        return jsonify({'message': 'Workout plan generated for the user.'})
    except Exception as e:
        return jsonify({'message': f'Failed to generate workout plan. Error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)