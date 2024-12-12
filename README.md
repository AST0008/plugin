# Plugin
## Description:
The Communication Assessment Tool is an intuitive web application designed to evaluate and improve users' communication skills. It provides a comprehensive workflow for recording responses, collecting feedback, and generating personalized assessment reports. The tool supports multiple languages, enabling users to engage in their preferred medium for a seamless experience.

## Key Features
- Multi-language Support: Supports 11 languages, including English and Indian languages .
- User-Friendly Workflow: Guides users from recording responses to receiving actionable feedback.
- Advanced Reports: Leverages (STT) and language processing to generate detailed reports.
- Actionable Suggestions: Offers recommendations to improve communication skills.
- Feedback : Gathers user feedback to enhance the app's usability and functionality.


## Screenshots

<img src="./img/workflow.jpg" />


## Tech Stack

**Client:** Next.js, Daisy UI (TailwindCSS)

**Server:** Python, FastAPI

**Database:** Supabase

**Speech-to-Text Models:** Sarvam AI Saarika V1, OpenAI Whisper

**Evaluation:** Gemma (fine-tuned from HuggingFace)
## To Run the App locally


### Prerequisites
- **Node.js** (v16+)
- **npm** or **yarn**
- **Python** (v3.9+)
- **Supabase** account for storage and database.


### 1. Clone the Repository
```
git clone <repository-url>

cd <repository-directory>
```



### 2. Frontend Setup
Navigate to the frontend directory:
```
cd frontend/lokahi
```
Install dependencies:

```
npm install
```
Create a .env.local file to store the Environment Variables

`GOOGLE_CLIENT_ID`, 
`GOOGLE_CLIENT_SECRET`,
`NEXTAUTH_SECRET`, 
`NEXTAUTH_URL=http://localhost:3000`



Start the Frontend server:

```
npm run dev
```
Access the application at http://localhost:3000.

### 3. Backend Setup

Navigate to the Backend directory:
```
cd backend
```
Install dependencies:

```
pip install -r requirements.txt
```
Start the development server:

```
uvicorn main:app --host 0.0.0.0 --port 8000
```



## Demo

Insert gif or link to demo


## Documentation

[Documentation](https://linktodocumentation)


## Authors

- [Ashwajit Tayade](https://www.github.com/AST0008)
- [Achintya Jai](https://github.com/pUrGe12)
- [Shrestho Chatterjee](https://github.com/shresthoc)
- [Archit Shukla](https://github.com/Murfing)


## Support

For support, email ashwajittayade30@gmail.com .

