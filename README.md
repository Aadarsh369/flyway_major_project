### FLYWAY

Flyway is a project for Flight Booking System

#### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your local machine.
- MongoDB installed and running locally or accessible remotely.
- Git installed on your local machine.
- Dependencies for machine learning models (if applicable).

#### Installation

To install this project, follow these steps:

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/your-username/project-name.git
    ```

2. Navigate to the project directory:
    ```bash
    cd project-name
    ```

3. Install dependencies for both the frontend, backend:
    ```bash
    cd client
    npm install
    cd ../server
    npm install
    cd ../models
    ```
4. Install dependencies for Machine Learning and python code:
    ```bash
    python  -m venv myenv
    myenv\Scripts\Activate
    pip install -r requirements.txt
    pip install spacy
    python -m spacy download en_core_web_sm
    ```


#### Configuration

Before running the project, ensure you configure any necessary environment variables. You may need to create a `.env` file in both the client and server directories.

Example `.env` file for the server:

```makefile
PORT=3001
MONGODB_URI=<your-mongodb-uri>
