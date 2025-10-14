 Smart Recipe Generator

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?logo=nextdotjs)](https://nextjs.org/)
[![Firestore](https://img.shields.io/badge/Firestore-Firebase-yellow?logo=firebase)](https://firebase.google.com/products/firestore)

---

##  Project Overview

The **Smart Recipe Generator** intelligently recommends recipes based on ingredients you already have. Simply enter your ingredients or scan them via an image, and get personalized recipe suggestions tailored to your pantry, dietary preferences, and cooking time. You can also **add your own recipes** to expand the collection.

---

##  Features

* 🔹 **Ingredient-based Recipe Search:** Enter your available ingredients and get curated recipes.
* 🔹 **Weighted Fuzzy Matching:** Ingredients are matched even if names are slightly misspelled or formatted differently.
* 🔹 **Add Your Own Recipe:** Users can contribute their own recipes to the database.
* 🔹 **Scan Ingredients Through Image:** Take a photo of your pantry items, and the app detects ingredients automatically using **Imagga API**.
* 🔹 **Recipe Metadata Filters:** Filter recipes by cooking time, difficulty, dietary preferences, and more.
* 🔹 **User Personalization:** Bookmark and save your favorite recipes.
* 🔹 **Interactive Frontend:** Built with Next.js and Shadcn UI for a smooth, modern experience.

---

##  Demo

![Demo GIF](https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif)
*Experience ingredient-based recipe suggestions in action!*

---

## 🛠️ Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Frontend         | Next.js, React, Shadcn UI, Tailwind CSS |
| Backend          | FastAPI, Python 3.11                    |
| Database         | Firebase Firestore                      |
| Cloud Storage    | Cloudinary                              |
| Image Processing | Imagga API                              |
| Libraries        | RapidFuzz, Pydantic, Firebase Admin SDK |

---

##  How It Works

1. **User Input:** Enter ingredients manually or scan through an image.
2. **Backend Processing:** FastAPI receives input and uses **weighted fuzzy matching** to compare with recipes in Firestore.
3. **Recipe Matching:** Recipes are ranked based on match score, cooking time, difficulty, and dietary filters.
4. **Results Displayed:** Recipes are displayed with images, cooking time, difficulty, and interactive cards.
5. **User Interaction:** Users can bookmark recipes, save them, or even add their own recipes to the database.

---

##  Project Structure

```text
smart-recipe-generator/
├─ backend/
│  ├─ main.py           # FastAPI server
│  ├─ models.py         # Pydantic models
│  ├─ utils.py          # Ingredient processing
│  └─ routes/           # API route modules
├─ frontend/
│  ├─ pages/            # Next.js pages
│  ├─ components/       # UI components
│  └─ styles/           # Tailwind CSS
├─ .env                 # API keys & secrets
└─ README.md
```

---

##  Local Setup

The project requires **several API keys** for full functionality:

* **Imagga API [https://imagga.com/](https://imagga.com/)** – for ingredient detection from images 
* **Firebase Firestore [https://firebase.google.com/](https://firebase.google.com/)** – for recipe storage and user data 
* **Cloudinary [https://cloudinary.com/](https://cloudinary.com/)** – for storing recipe images 

### Steps:

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/smart-recipe-generator.git
cd smart-recipe-generator
```

2. **Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

3. **Create `.env` file** in `backend/`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
IMAGGA_API_KEY=your_imagga_api_key
IMAGGA_API_SECRET=your_imagga_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. **Run Backend**

```bash
uvicorn main:app --reload
```

5. **Frontend Setup**

```bash
cd ../frontend
npm install
npm run dev
```
6. **Create `.env` file** in `backend/`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_API_Key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_ProjectID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_senderID"
NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_AppID"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_firebase_measurementID"
NEXT_PUBLIC_API_BASE_URL = "your_local_host_url"
```

6. **Access Locally**
   Frontend: [http://localhost:3000](http://localhost:3000)
   Backend: [http://localhost:8000](http://localhost:8000)

---


If you want, I can **also create a version with interactive badges for each feature, collapsible setup steps, and a visual workflow diagram** that looks like a modern project portfolio.

Do you want me to do that next?
