import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="container-custom py-16">
      <div className="mx-auto space-y-12">
        <section className="bg-white rounded-3xl shadow-lg p-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block text-sm uppercase tracking-[0.3em] text-primary-600 mb-4">
                Our story
              </span>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                The marketplace built for Ethiopia and beyond
              </h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                E-Store is a modern shopping destination designed to connect
                local sellers with customers who want quality products, fast
                delivery, and a trusted checkout experience.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We combine curated collections, secure payments, and friendly
                support to make every purchase simple and reliable.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                <h2 className="font-semibold text-xl mb-2 text-gray-900">
                  Our mission
                </h2>
                <p className="text-gray-600">
                  Empower shoppers and sellers by offering a beautiful,
                  easy-to-use online store with local flavor.
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                <h2 className="font-semibold text-xl mb-2 text-gray-900">
                  Our vision
                </h2>
                <p className="text-gray-600">
                  Become the go-to destination for trusted online shopping
                  through speed, transparency, and exceptional customer service.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-10">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Why shop with us?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We offer curated products, clear pricing, and a friendly
                shopping experience that helps you discover what you need
                faster.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Local support
              </h3>
              <p className="text-gray-600">
                We support local sellers and help buyers find quality goods
                across electronics, fashion, books, and more.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Secure checkout
              </h3>
              <p className="text-gray-600">
                Every order is secured with trusted payment handling so you can
                shop with confidence.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-10">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-2">Our values</h3>
              <ul className="space-y-3 text-gray-600">
                <li>Honesty in every product listing</li>
                <li>Fast, friendly customer support</li>
                <li>Local and international product variety</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-2">What we offer</h3>
              <ul className="space-y-3 text-gray-600">
                <li>Electronics, clothing, books, and more</li>
                <li>Responsive cart and checkout flow</li>
                <li>Order tracking and customer alerts</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-2">Our promise</h3>
              <p className="text-gray-600 leading-relaxed">
                We are committed to building a shopping experience you can
                trust, with transparent service and a strong focus on customer
                happiness.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 text-white font-semibold shadow-lg shadow-primary-200 hover:bg-primary-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
