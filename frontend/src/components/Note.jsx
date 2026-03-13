import React, { useState } from "react";
import "../styles/Note.css"

function Note({note, onDelete, onModify, onToggle, onBlockToggle}) {

    const [confirming, setConfirming] = useState(false)

    const formattedDate = new Date(note.created_at).toLocaleDateString("en-UK", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    const handleDeleteClick = (e) => {
        if (e.ctrlKey) {
            onDelete(note.id)
        } else {
            setConfirming(true)
        }
    }

    return <div className="note-container">
        <p className="note-title">{note.title}</p>
        <div className="note-content">
            {Array.isArray(note.content) && note.content.map((block, index) => (
                block.type === "text" ? (
                    <p key={index}>{block.value}</p>
                ) : (
                    <label key={index} className="checklist-item">
                        <input
                            type="checkbox"
                            checked={block.checked}
                            onChange={() => onBlockToggle(note, index)}
                        />
                        {block.label}
                    </label>
                )
            ))}
        </div>
        <div className="note-footer">
            <button className="modify-button" onClick={() => onModify(note)}>Update</button>
            <button
                className={`done-toggle ${note.completed ? "done-toggle--on" : "done-toggle--off"}`}
                onClick={() => onToggle(note)}
                type="button"
            >
                {note.completed ? "✓ Done" : "○ Done"}
            </button>
            <button className="delete-button" onClick={handleDeleteClick}>Delete</button>
        </div>
        <div className={`delete-confirm-row ${confirming ? "delete-confirm-row--visible" : "delete-confirm-row--hidden"}`}>
            <span>Are you sure?</span>
            <button type="button" className="delete-confirm-yes" onClick={() => onDelete(note.id)}>Yes</button>
            <button type="button" className="delete-confirm-no" onClick={() => setConfirming(false)}>No</button>
        </div>
        <p className="note-date">{formattedDate}</p>
        </div>
        }

export default Note