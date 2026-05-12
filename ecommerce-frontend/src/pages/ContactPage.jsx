import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import contactService from "../services/contactService";

const ContactPage = () => {
  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !contact.name ||
      !contact.email ||
      !contact.subject ||
      !contact.message
    ) {
      toast.error("Please complete all fields before submitting.");
      return;
    }

    try {
      await contactService.sendContactMessage(contact);
      toast.success("Your message has been sent. We'll get back to you soon.");
      setContact({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send your message. Please try again later."
      );
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="mx-auto grid gap-10 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-10 shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 mb-6">
            Have a question, feedback, or need help with an order? Send us a
            message and our support team will reply within one business day.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg text-gray-900">Email</h2>
              <p className="text-gray-600">support@estore.com</p>
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900">Phone</h2>
              <p className="text-gray-600">+251 911 000 000</p>
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900">Address</h2>
              <p className="text-gray-600">Addis Ababa, Ethiopia</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-gray-600">
                Send us a message and our support team will reply within one
                business day.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-medium text-gray-900">Name</label>
              <input
                type="text"
                name="name"
                value={contact.name}
                onChange={handleChange}
                className="input-field mt-2 w-full"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="font-medium text-gray-900">Email</label>
              <input
                type="email"
                name="email"
                value={contact.email}
                onChange={handleChange}
                className="input-field mt-2 w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="font-medium text-gray-900">Subject</label>
              <input
                type="text"
                name="subject"
                value={contact.subject}
                onChange={handleChange}
                className="input-field mt-2 w-full"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="font-medium text-gray-900">Message</label>
              <textarea
                name="message"
                value={contact.message}
                onChange={handleChange}
                className="input-field mt-2 w-full min-h-[140px]"
                placeholder="Write your message here"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-white font-semibold shadow-lg shadow-primary-200 hover:bg-primary-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;
