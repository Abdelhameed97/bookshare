import React from "react";
import { Card, Button } from "react-bootstrap";

const BookCard = ({ book }) => {
  return (
    <Card className="h-100 shadow-sm position-relative">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={
            book.images?.[0]
              ? `http://localhost:8000/storage/${book.images[0]}`
              : "https://via.placeholder.com/150"
          }
          className="rounded-top"
        />
        <div
          className="position-absolute"
          style={{
            top: "10px",
            left: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Button variant="light" size="sm">🛒</Button>
          <Button variant="light" size="sm">❤️</Button>
          <Button variant="light" size="sm">🔍</Button>
          <Button variant="light" size="sm">👁</Button>
        </div>
      </div>
      <Card.Body>
        <Card.Title>{book.title}</Card.Title>
        <Card.Text>
          <strong>${book.price}</strong>
          <br />
          <small>By {book.user?.name || "Unknown"}</small>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
