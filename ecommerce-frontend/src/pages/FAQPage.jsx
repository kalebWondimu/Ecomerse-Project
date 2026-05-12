import React, { useState } from "react";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products from the Products page, add items to your cart, then proceed to checkout. You can review your shipping details and payment method before confirming.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept card payments as well as local payment gateways. The checkout page will show the available payment options when you place your order.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes. Once your order is placed, visit the Orders page to see the current order status and details.",
  },
  {
    question: "How do I change my shipping address?",
    answer:
      "Update your profile address on the Profile page before checking out. If you need help after placing an order, contact support using the Contact page.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container-custom py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="bg-white rounded-3xl shadow-lg p-10">
          <h1 className="text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Find answers to the most common questions about shopping at E-Store.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={item.question}
              className="rounded-3xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-lg font-medium text-gray-900">
                  {item.question}
                </span>
                <span className="text-primary-600">
                  {openIndex === index ? "-" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="border-t border-gray-100 px-6 py-5 text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-10">
          <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            If you don't find the answer here, our team is ready to assist you.
          </p>
          <Link
            to="/contact"
            className="btn-primary inline-flex items-center justify-center px-8 py-3"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
