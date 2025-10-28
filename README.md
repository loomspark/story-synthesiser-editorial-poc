Hack Day: Editorial Workflow (Part 2)
=====================================

Mission
-------

Our goal in this one-day hack is to build a "Story Browser" web app. This tool will read the synthetic stories from Part 1, analyze them with AI, and allow an editor to generate a draft article based on a chosen story.

Key Contacts
------------

-   **Project Sponsor:** Rob Scott

-   **Tech Lead:** James Patterson

Key Documents
-------------

-   **The Full Vision:** [Link to "Story Synthesiser Project Summary" Google Doc](https://docs.google.com/document/d/1agnpyRNVPFN-QcOToBnM3jOArYQuqndXMJr4NMdfR10/edit?usp=sharing)

-   **The Brand Voice:** `Made Impact Brand Voice.pdf` (See project files)

Prerequisites
-------------

Before you begin, please do the following:

1.  **Install Ollama:** We will use `llama3` as our local LLM.

2.  **Add Data Files:**

    -   Create a `/data` folder at the root of this project.

    -   Add the `stories.json` file from Part 1 into `/data`.

    -   Add the `Brand_Voice.pdf` file into `/data`. *(These files will be ignored by .gitignore and are not checked into the repo).*

Definition of Success (The "Win")
---------------------------------

A working end-to-end flow:

1.  **Backend:** A script that reads `stories.json` and creates `stories_analyzed.json`. An API that generates draft articles.

2.  **Frontend:** A web app that loads `stories_analyzed.json` and uses the API to generate and display a draft article.

Suggested Tech Stack
--------------------

This is a suggestion. The team can make a final decision with the Tech Lead.

-   **Frontend:** React

-   **Backend (for AI API):** Python (Flask or FastAPI)

-   **LLM:** Ollama + Llama3

-   **AI Script:** Python

Data Models
-----------

This is the most important part of the plan.

### Input Model (`/data/stories.json`)

This is the file we get from Part 1.

```
[
  {
    "user": {
      "user_id": "string",
      "name": "string",
      "gender": "string",
      "DOB": "string",
      "origin_address": "string",
      "nationality": "string"
    },
    "experience": {
      "experience_id": "string",
      "destination_country": "string",
      "experience_type": "string"
    },
    "story": {
      "story_id": "string",
      "title": "string",
      "body_text": "string",
      "is_negative": "boolean"
    }
  }
]

```

### Output Model (`stories_analyzed.json`)

This is the **target** for the Backend Team and the **starting point** for the Frontend Team.

```
[
  {
    "user": { ... },
    "experience": { ... },
    "story": { ... },
    "ai_analysis": {
      "sentiment": "string (e.g., 'Positive', 'Negative', 'Heartwarming')",
      "quality_score": "float (0.0 to 1.0)",
      "themes": "array[string] (e.g., ['Friendship', 'Solo Travel'])",
      "summary": "string (A one-sentence summary)"
    }
  }
]

```
