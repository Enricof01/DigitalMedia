"use client";
import "bootstrap/dist/css/bootstrap.min.css";


import { Container, Nav, Navbar } from "react-bootstrap";

export default function AppNavbar() {
  return (
    <Navbar expand="lg" bg="light">
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/test">Test</Nav.Link>
            <Nav.Link href="/">Home</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}