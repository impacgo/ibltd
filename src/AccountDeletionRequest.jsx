import React, { useState } from "react";
import "./AccountDeletionRequest.css";

export default function AccountDeletionRequest() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("https://your-api-url.com/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="delete-container">
      <h2>Account & Data Deletion Request</h2>
      <p className="desc">
        Fill out the form below if you want to permanently delete your account
        and associated data from our system.
      </p>

      <form className="delete-form" onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          placeholder="Your Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <label>Reason for Request</label>
        <textarea
          name="message"
          placeholder="Tell us why you want to delete your account..."
          value={form.message}
          onChange={handleChange}
          rows="4"
        ></textarea>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Submitting..." : "Submit Request"}
        </button>

        {status === "success" && (
          <p className="success-msg">Request submitted successfully. We will contact you shortly.</p>
        )}

        {status === "error" && (
          <p className="error-msg">Something went wrong. Please try again later.</p>
        )}
      </form>
    </div>
  );
}
