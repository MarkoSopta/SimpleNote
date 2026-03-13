import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Note from "../components/Note";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Home.css";

const TEXT_BLOCK = "text";
const CHECKBOX_BLOCK = "checkbox";

const createBlock = (type = TEXT_BLOCK) =>
  type === TEXT_BLOCK
    ? { type: TEXT_BLOCK, value: "" }
    : { type: CHECKBOX_BLOCK, label: "", checked: false };

const normalizeContent = (content) =>
  Array.isArray(content) ? content : [{ type: TEXT_BLOCK, value: content || "" }];

const updateBlockValue = (block, value) =>
  block.type === TEXT_BLOCK ? { ...block, value } : { ...block, label: value };

function BlockEditor({
  blocks,
  onUpdate,
  onRemove,
  onAdd,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  return (
    <>
      {blocks.map((block, index) => (
        <div
          key={index}
          className={`block-row block-row--${block.type}`}
          draggable={draggable}
          onDragStart={draggable ? () => onDragStart(index) : undefined}
          onDragOver={draggable ? onDragOver : undefined}
          onDrop={draggable ? () => onDrop(index) : undefined}
        >
          {draggable && <span className="drag-handle">&#8942;&#8942;</span>}
          <span className="block-type-badge">{block.type === TEXT_BLOCK ? "T" : "☑"}</span>
          {block.type === TEXT_BLOCK ? (
            <textarea
              value={block.value}
              onChange={(event) => onUpdate(index, event.target.value)}
              placeholder="Text..."
            />
          ) : (
            <input
              type="text"
              value={block.label}
              onChange={(event) => onUpdate(index, event.target.value)}
              placeholder="Checkbox label..."
            />
          )}
          <button type="button" className="btn-remove" onClick={() => onRemove(index)}>
            ✕
          </button>
        </div>
      ))}
      <div className="block-add-buttons">
        <button type="button" className="btn-add-text" onClick={() => onAdd(TEXT_BLOCK)}>
          + Text
        </button>
        <button type="button" className="btn-add-checkbox" onClick={() => onAdd(CHECKBOX_BLOCK)}>
          + Checkbox
        </button>
      </div>
    </>
  );
}

function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([createBlock(TEXT_BLOCK)]);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBlocks, setEditBlocks] = useState([]);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/login");
  };

  const dragIndex = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getNotes = async () => {
    try {
      const response = await api.get("/api/notes/");
      setNotes(response.data);
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

  const addBlockTo = (setter) => (type) => {
    setter((previous) => [...previous, createBlock(type)]);
  };

  const updateBlockIn = (setter) => (index, value) => {
    setter((previous) =>
      previous.map((block, blockIndex) =>
        blockIndex === index ? updateBlockValue(block, value) : block
      )
    );
  };

  const removeBlockFrom = (setter) => (index) => {
    setter((previous) => previous.filter((_, blockIndex) => blockIndex !== index));
  };

  const addBlock = addBlockTo(setBlocks);
  const updateBlock = updateBlockIn(setBlocks);
  const removeBlock = removeBlockFrom(setBlocks);

  const addEditBlock = addBlockTo(setEditBlocks);
  const updateEditBlock = updateBlockIn(setEditBlocks);
  const removeEditBlock = removeBlockFrom(setEditBlocks);

  const handleModifyClick = (note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditBlocks(normalizeContent(note.content));
  };

  const onDragStart = (index) => {
    dragIndex.current = index;
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onDrop = (index) => {
    if (dragIndex.current === null || dragIndex.current === index) {
      return;
    }

    setEditBlocks((previous) => {
      const updated = [...previous];
      const [dragged] = updated.splice(dragIndex.current, 1);
      updated.splice(index, 0, dragged);
      return updated;
    });

    dragIndex.current = null;
  };

  const createNote = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/api/notes/", { title, content: blocks });
      if (response.status !== 201) {
        showToast("Failed to create note", "error");
        return;
      }

      setNotes((previous) => [response.data, ...previous]);
      setTitle("");
      setBlocks([createBlock(TEXT_BLOCK)]);
      showToast("Note created");
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const modifyNote = async (event) => {
    event.preventDefault();
    if (!editingNote) {
      return;
    }

    try {
      const response = await api.put(`/api/notes/modify/${editingNote.id}/`, {
        title: editTitle,
        content: editBlocks,
      });

      if (response.status !== 200) {
        showToast("Failed to update note", "error");
        return;
      }

      setNotes((previous) =>
        previous.map((note) => (note.id === response.data.id ? response.data : note))
      );
      setEditingNote(null);
      showToast("Note updated");
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await api.delete(`/api/notes/delete/${id}/`);
      if (response.status !== 204) {
        showToast("Failed to delete note", "error");
        return;
      }

      setNotes((previous) => previous.filter((note) => note.id !== id));
      showToast("Note deleted");
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const toggleNote = async (note) => {
    try {
      const response = await api.patch(`/api/notes/modify/${note.id}/`, {
        completed: !note.completed,
      });

      if (response.status !== 200) {
        showToast("Failed to update note", "error");
        return;
      }

      setNotes((previous) =>
        previous.map((item) => (item.id === response.data.id ? response.data : item))
      );
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const toggleBlockCheckbox = async (note, index) => {
    const content = normalizeContent(note.content);
    const updatedContent = content.map((block, blockIndex) =>
      blockIndex === index ? { ...block, checked: !block.checked } : block
    );

    try {
      const response = await api.patch(`/api/notes/modify/${note.id}/`, {
        content: updatedContent,
      });

      if (response.status !== 200) {
        showToast("Failed to update note", "error");
        return;
      }

      setNotes((previous) =>
        previous.map((item) => (item.id === response.data.id ? response.data : item))
      );
    } catch (error) {
      showToast(String(error), "error");
    }
  };



  return (
    <div className="page">
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.message}</div>
      )}
      {editingNote && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Modify Note</h2>
            <form onSubmit={modifyNote}>
              <label htmlFor="edit-title">Title:</label>
              <br />
              <input
                type="text"
                id="edit-title"
                name="title"
                required
                onChange={(e) => setEditTitle(e.target.value)}
                value={editTitle}
              />
              <label>Content:</label>
              <BlockEditor
                blocks={editBlocks}
                onUpdate={updateEditBlock}
                onRemove={removeEditBlock}
                onAdd={addEditBlock}
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />
              <input type="submit" value="Update"></input>
              <button type="button" onClick={() => setEditingNote(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
      <div className="create-section">
        <h2>Create a Note</h2>
        <form onSubmit={createNote}>
          <label htmlFor="title">Title:</label>
          <br />
          <input
            type="text"
            id="title"
            name="title"
            required
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <label>Content:</label>
          <BlockEditor
            blocks={blocks}
            onUpdate={updateBlock}
            onRemove={removeBlock}
            onAdd={addBlock}
          />
          <div className="create-form-footer">
            <input type="submit" value="Submit" />
            <button type="button" className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </form>
      </div>
      <div className="notes-section">
        <h2>Notes</h2>
        <div className="notes-grid">
          {notes.map((note) => <Note note={note} onDelete={deleteNote} onModify={handleModifyClick} onToggle={toggleNote} onBlockToggle={toggleBlockCheckbox} key={note.id} />)}
        </div>
      </div>
    </div>
  );
}

export default Home;