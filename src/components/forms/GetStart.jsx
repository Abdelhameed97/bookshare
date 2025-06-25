import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/bookshare-logo.png";

export default function GetStarted() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmedRole, setConfirmedRole] = useState(null);
  const navigate = useNavigate();

  const roles = [
    {
      id: "owner",
      title: "I own a library",
      description:
        "Manage and showcase your book collection for borrowing/sale",
      modalContent: (
        <>
          <h5 className='text-primary fw-bold mb-3'>Library Owner Role</h5>
          <p className='text-muted mb-3'>As a library owner, you can:</p>
          <ul className='list-unstyled ps-4'>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Add books to your collection</span>
            </li>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Set borrowing policies or sale prices</span>
            </li>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Manage client requests</span>
            </li>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Track borrowed/sold books</span>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "client",
      title: "I love books",
      description: "Browse, borrow, or purchase books from local libraries",
      modalContent: (
        <>
          <h5 className='text-primary fw-bold mb-3'>Book Lover Role</h5>
          <p className='text-muted mb-3'>As a book lover, you can:</p>
          <ul className='list-unstyled ps-4'>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Browse available books</span>
            </li>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Borrow or purchase books</span>
            </li>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Save favorites to your wishlist</span>
            </li>
            <li className='mb-2 d-flex align-items-start'>
              <span className='me-2 text-success'>✓</span>
              <span>Rate and review books</span>
            </li>
          </ul>
        </>
      ),
    },
  ];

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectRole = () => {
    if (!selectedRole) return;
    setConfirmedRole(selectedRole);
    setShowModal(false);
  };

  const handleContinue = () => {
    if (confirmedRole) {
      navigate("/register", {
        state: {
          role: confirmedRole.id,
        },
      });
    }
  };

  return (
    <div
      className='bg-light p-4 rounded-3 shadow-sm vh-100 align-items-center justify-content-center d-flex flex-column'
      style={{ maxWidth: "60%", width: "100%" }}
    >
      <img
        src={logo}
        alt='BookShare Logo'
        style={{ maxWidth: "200px", height: "auto" }}
        onError={(e) => {
          e.target.src = "/default-book-icon.png";
          e.target.style.padding = "1rem";
        }}
      />

      <h2 className='text-center mb-4 fw-bold text-dark'>
        How do you want to use our website?
      </h2>
      <p className='text-center mb-4 text-muted'>
        We'll personalize your experience accordingly.
      </p>

      <div className='mb-4 w-100'>
        {roles.map((role) => (
          <div
            key={role.id}
            role='radio'
            aria-checked={selectedRole?.id === role.id}
            tabIndex={0}
            className={`p-3 mb-3 border rounded-3 bg-white ${
              selectedRole?.id === role.id
                ? "border-primary border-2 shadow-sm"
                : "border-light-subtle"
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => handleRoleClick(role)}
            onKeyDown={(e) => e.key === "Enter" && handleRoleClick(role)}
          >
            <div className='form-check'>
              <input
                type='radio'
                className='form-check-input'
                checked={selectedRole?.id === role.id}
                readOnly
              />
              <label className='form-check-label fw-bold text-dark'>
                {role.title}
              </label>
              <p className='text-muted mt-1 mb-0 ps-4'>{role.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant='primary'
        className='w-100 py-2 fw-bold rounded-2'
        disabled={!confirmedRole}
        onClick={handleContinue}
      >
        {confirmedRole
          ? `Continue as ${confirmedRole.title.toLowerCase()}`
          : "Select a role"}
      </Button>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        style={{
          position: "fixed",
          right: 0,
          left: "auto",
          top: 0,
          bottom: 0,
          width: "40%",
          margin: 0,
        }}
        dialogClassName='m-0 h-100'
        contentClassName='h-100 rounded-0'
      >
        <Modal.Header closeButton className='border-bottom-0 pb-0'>
          <Modal.Title className='fw-bold text-dark'>Role Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='pt-0'>{selectedRole?.modalContent}</Modal.Body>
        <Modal.Footer className='border-top-0'>
          <Button
            variant='outline-secondary'
            onClick={handleCloseModal}
            className='rounded-1'
          >
            Close
          </Button>
          <Button
            variant='primary'
            onClick={handleSelectRole}
            className='rounded-1'
          >
            Select This Role
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
