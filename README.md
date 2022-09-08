# FOODPANDA API

This API allows for control user to control and update the database as leverage for a food ordering app.

## Request Format

    All requests are made in JSON format

## Sign Up User

    POST request with name, password, check_password.

    All fields required.

### Request Structure

`POST /auth/signup`

    {
        "name": "john doe",
        "email": "johndoe@email.com"
        "password": "1234567890",
        "confirm_password": "1234567890"
    }

## Log In User
