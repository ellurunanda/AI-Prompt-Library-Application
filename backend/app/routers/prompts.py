from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Prompt
from ..schemas import PromptCreate, PromptResponse, PromptListItem
from ..redis_client import increment_view_count, get_view_count

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.get("", response_model=List[PromptListItem])
def list_prompts(db: Session = Depends(get_db)):
    prompts = db.query(Prompt).order_by(Prompt.created_at.desc()).all()
    return prompts


@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(prompt_data: PromptCreate, db: Session = Depends(get_db)):
    new_prompt = Prompt(
        title=prompt_data.title,
        content=prompt_data.content,
        complexity=prompt_data.complexity,
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)

    response = PromptResponse(
        id=new_prompt.id,
        title=new_prompt.title,
        content=new_prompt.content,
        complexity=new_prompt.complexity,
        created_at=new_prompt.created_at,
        view_count=0,
    )
    return response


@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prompt with id {prompt_id} not found",
        )

    view_count = increment_view_count(prompt_id)

    response = PromptResponse(
        id=prompt.id,
        title=prompt.title,
        content=prompt.content,
        complexity=prompt.complexity,
        created_at=prompt.created_at,
        view_count=view_count,
    )
    return response