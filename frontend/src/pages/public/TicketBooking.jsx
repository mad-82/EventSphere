import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import eventService from "../../services/eventService";
import api from "../../services/api";
import "./TicketBooking.css";

export default function TicketBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expo, setExpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [ticketType, setTicketType] = useState("Standard");
  const [qty, setQty] = useState(1);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    confirmEmail: "",
    phone: user?.phone || "",
    country: "Pakistan",
    city: "",
    organization: user?.companyName || "",
    jobTitle: "",
    specialRequirements: "",
    referralSource: "",

    senderName: "",
    senderBankName: "",
    senderAccountTitle: "",
    senderAccountLast4: "",
    transactionRef: "",
    amountTransferred: "",
    paymentDate: "",
    paymentTime: "",
    paymentNotes: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [updatesAccepted, setUpdatesAccepted] = useState(false);

  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: `/ticket/${id}` } });
      return;
    }

    let active = true;

    eventService.getById(id)
      .then((res) => {
        if (active) {
          // ✅ DEBUG: bank details check karne ke liye
          console.log("Expo loaded:", res.expo);
          console.log("Bank Details:", res.expo?.bankDetails);
          setExpo(res.expo);
        }
      })
      .catch((err) => {
        console.error("Event loading error:", err);
        if (active) setErrorMsg("Unable to load event details.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const vipPrice = Number(expo?.vipPrice || 5000);
  const totalAmount = ticketType === "VIP" ? vipPrice * qty : 0;

  const bankDetails = expo?.bankDetails || {};

  const formatPrice = (amount) =>
    `PKR ${Number(amount).toLocaleString("en-PK")}`;

  const copyText = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      alert("Copied successfully!");
    } catch {
      setErrorMsg("Unable to copy. Please copy the details manually.");
    }
  };

  const handleCloseModal = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (booking) return;

    const requiredFields = [
      formData.firstName, formData.lastName, formData.email,
      formData.confirmEmail, formData.phone, formData.country, formData.city,
    ];

    if (requiredFields.some((field) => !String(field).trim())) {
      setErrorMsg("Please complete all required personal information fields.");
      return;
    }

    if (formData.email.trim().toLowerCase() !== formData.confirmEmail.trim().toLowerCase()) {
      setErrorMsg("Email addresses do not match.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setErrorMsg("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    if (ticketType === "VIP") {
      const vipFields = [
        formData.senderName, formData.senderBankName, formData.senderAccountTitle,
        formData.senderAccountLast4, formData.transactionRef,
        formData.amountTransferred, formData.paymentDate,
      ];

      if (vipFields.some((field) => !String(field).trim())) {
        setErrorMsg("Please complete all required payment information.");
        return;
      }

      if (!/^\d{4}$/.test(formData.senderAccountLast4)) {
        setErrorMsg("Enter the last 4 digits of your sender account.");
        return;
      }

      if (Number(formData.amountTransferred) < totalAmount) {
        setErrorMsg(`Please transfer at least ${formatPrice(totalAmount)}.`);
        return;
      }

      if (!formData.transactionRef.trim() || formData.transactionRef.trim().length < 5) {
        setErrorMsg("Please enter a valid transaction reference.");
        return;
      }
    }

    setBooking(true);

    const payload = {
      expoId: id,
      ticketType,
      quantity: qty,
      ...formData,
      totalAmount,
      termsAccepted,
      privacyAccepted,
      updatesAccepted,
    };

    try {
      const res = await api.post("/registrations", payload);

      // ✅ FIX: axios response -> res.data mein actual payload hota hai
      console.log("Full axios response:", res);
      console.log("Response data:", res.data);

      const registration = res?.data?.registration;

      if (!registration) {
        console.error("Registration missing. Response was:", res.data);
        throw new Error(
          res?.data?.message || "Booking response was incomplete. Please contact support."
        );
      }

      setSuccessData(registration);
      setModalOpen(true);

      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        navigate("/");
      }, 10000);

    } catch (err) {
      console.error("Booking error:", err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "Unable to complete booking. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-page ticket-loading-screen">
        <div className="ticket-loading"></div>
        <p className="mt-3">Preparing your checkout experience...</p>
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="ticket-page ticket-loading-screen">
        <h3>Event Not Available</h3>
        <p>{errorMsg || "We could not find this event."}</p>
        <Link to="/events" className="btn-gradient px-4 py-2">Browse Events</Link>
      </div>
    );
  }

  const eventDate = expo.startDate || expo.date;
  const eventLocation = expo.location || expo.venue || "Location to be announced";
  const isVIP = ticketType === "VIP";

  const bookingReference = successData?.bookingReference;
  const ticketId = successData?.ticketId;

  const isVIPPending =
    isVIP &&
    String(successData?.paymentStatus || "").toLowerCase().includes("pending");

  return (
    <div className="ticket-page">
      <div className="container py-5 ticket-container">

        <Link to={`/events/${expo.id}`} className="hero-back-link mb-4 d-inline-flex">
          <span>←</span> Back to Event
        </Link>

        <div className="event-ticket-hero mb-4">
          <div className="event-hero-content">
            <span className="event-eyebrow">OFFICIAL EVENT REGISTRATION</span>
            <h1>{expo.title}</h1>
            <p>Complete your registration and secure your place at this event.</p>
            <div className="event-meta-list">
              <span>📅 {eventDate ? new Date(eventDate).toLocaleDateString() : "Date to be announced"}</span>
              <span>📍 {eventLocation}</span>
            </div>
          </div>
          <div className="event-hero-decoration"><span>EXPO</span></div>
        </div>

        <div className="animated-gradient-box">
          <div className="ticket-card-inner">

            <div className="text-center mb-5">
              <span className="checkout-eyebrow">YOUR EXPERIENCE STARTS HERE</span>
              <h2 className="ticket-title">Secure Your Ticket</h2>
              <p className="ticket-subtitle">Choose your experience and complete your registration.</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* 1. TICKET SELECTION */}
              <section className="ticket-section">
                <div className="section-title-row">
                  <span className="section-number">01</span>
                  <div>
                    <h4 className="section-heading">Choose Your Ticket</h4>
                    <p className="section-description">Select the pass that best suits your experience.</p>
                  </div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <button
                      type="button"
                      className={`ticket-card ticket-option ${ticketType === "Standard" ? "selected" : ""}`}
                      onClick={() => { setTicketType("Standard"); setErrorMsg(""); }}
                      aria-pressed={ticketType === "Standard"}
                    >
                      <div className="ticket-card-top">
                        <span className="ticket-plan-label">GENERAL ADMISSION</span>
                        <span className="radio-circle"></span>
                      </div>
                      <h3 className="ticket-plan-name">Standard Pass</h3>
                      <div className="price">FREE</div>
                      <p className="ticket-description">Everything you need to explore the expo.</p>
                      <div className="ticket-divider"></div>
                      <ul className="features-list">
                        <li><span>✓</span> General Admission</li>
                        <li><span>✓</span> Access to Exhibition Areas</li>
                        <li><span>✓</span> Explore Participating Exhibitors</li>
                        <li><span>✓</span> General Expo Activities</li>
                        <li><span>✓</span> Digital Ticket Confirmation</li>
                      </ul>
                      <span className="ticket-select-label">
                        {ticketType === "Standard" ? "✓ SELECTED" : "SELECT STANDARD"}
                      </span>
                    </button>
                  </div>

                  <div className="col-md-6">
                    <button
                      type="button"
                      className={`ticket-card ticket-option vip-ticket ${ticketType === "VIP" ? "selected" : ""}`}
                      onClick={() => { setTicketType("VIP"); setErrorMsg(""); }}
                      aria-pressed={ticketType === "VIP"}
                    >
                      <div className="ticket-card-top">
                        <span className="ticket-plan-label vip-label">PREMIUM EXPERIENCE</span>
                        <span className="radio-circle"></span>
                      </div>
                      <h3 className="ticket-plan-name">VIP Pass</h3>
                      <div className="price">{formatPrice(vipPrice)}</div>
                      <p className="ticket-description">Enjoy exclusive privileges and priority access.</p>
                      <div className="ticket-divider"></div>
                      <ul className="features-list">
                        <li><span>✓</span> All Standard Benefits</li>
                        <li><span>✓</span> Priority Entry & Check-in</li>
                        <li><span>✓</span> Exclusive VIP Access</li>
                        <li><span>✓</span> Designated VIP Areas</li>
                        <li><span>✓</span> Priority Assistance</li>
                      </ul>
                      <span className="ticket-select-label">
                        {ticketType === "VIP" ? "✓ SELECTED" : "SELECT VIP"}
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* QUANTITY */}
              <section className="checkout-panel mb-5">
                <div className="section-title-row">
                  <span className="section-number">02</span>
                  <div>
                    <h4 className="section-heading">Ticket Quantity</h4>
                    <p className="section-description">Choose how many tickets you need.</p>
                  </div>
                </div>
                <div className="quantity-control">
                  <label htmlFor="ticketQuantity">Number of Tickets</label>
                  <select
                    id="ticketQuantity"
                    className="form-select quantity-select"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} Ticket{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </section>

              {/* PERSONAL INFO */}
              <section className="checkout-panel mb-5">
                <div className="section-title-row">
                  <span className="section-number">03</span>
                  <div>
                    <h4 className="section-heading">Personal Information</h4>
                    <p className="section-description">Enter the attendee details for your booking.</p>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input type="text" name="firstName" className="form-control" placeholder="Enter first name" value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name *</label>
                    <input type="text" name="lastName" className="form-control" placeholder="Enter last name" value={formData.lastName} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address *</label>
                    <input type="email" name="email" className="form-control" placeholder="example@email.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirm Email Address *</label>
                    <input type="email" name="confirmEmail" className="form-control" placeholder="Re-enter email address" value={formData.confirmEmail} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number *</label>
                    <input type="tel" name="phone" className="form-control" placeholder="+92 3XX XXXXXXX" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country *</label>
                    <select name="country" className="form-select" value={formData.country} onChange={handleChange} required>
                      <option value="Pakistan">Pakistan</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">City *</label>
                    <input type="text" name="city" className="form-control" placeholder="Enter your city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Organization / Company</label>
                    <input type="text" name="organization" className="form-control" placeholder="Company name (optional)" value={formData.organization} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Job Title / Designation</label>
                    <input type="text" name="jobTitle" className="form-control" placeholder="Your designation" value={formData.jobTitle} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">How Did You Hear About Us?</label>
                    <select name="referralSource" className="form-select" value={formData.referralSource} onChange={handleChange}>
                      <option value="">Select an option</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Website">Website</option>
                      <option value="Friend / Referral">Friend / Referral</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Special Requirements / Accessibility Requests</label>
                    <textarea name="specialRequirements" className="form-control" rows="3" placeholder="Let us know if you have any special requirements..." value={formData.specialRequirements} onChange={handleChange} />
                  </div>
                </div>
              </section>

              {/* VIP PAYMENT */}
              {isVIP && (
                <section className="payment-section checkout-panel mb-5">
                  <div className="section-title-row">
                    <span className="section-number">04</span>
                    <div>
                      <h4 className="section-heading">VIP Payment Details</h4>
                      <p className="section-description">
                        Transfer the amount to the organizer's account and submit your transaction details.
                      </p>
                    </div>
                  </div>

                  <div className="bank-detail-box mb-4">
                    <div className="bank-panel-heading">
                      <span className="bank-icon">🏦</span>
                      <div>
                        <h5>Organizer Bank Account</h5>
                        <p>Use these details to complete your bank transfer.</p>
                      </div>
                    </div>

                    <div className="bank-detail-row">
                      <span>Bank Name</span>
                      <strong>{bankDetails.bankName || "Not configured"}</strong>
                    </div>
                    <div className="bank-detail-row">
                      <span>Account Title</span>
                      <strong>{bankDetails.accountTitle || "Not configured"}</strong>
                    </div>
                    <div className="bank-detail-row">
                      <span>Account Number</span>
                      <div className="bank-copy-value">
                        <strong>{bankDetails.accountNumber || "Not configured"}</strong>
                        {bankDetails.accountNumber && (
                          <button type="button" className="copy-btn" onClick={() => copyText(bankDetails.accountNumber)}>Copy</button>
                        )}
                      </div>
                    </div>
                    <div className="bank-detail-row">
                      <span>IBAN</span>
                      <div className="bank-copy-value">
                        <strong>{bankDetails.iban || "Not configured"}</strong>
                        {bankDetails.iban && (
                          <button type="button" className="copy-btn" onClick={() => copyText(bankDetails.iban)}>Copy</button>
                        )}
                      </div>
                    </div>
                    <div className="bank-detail-row">
                      <span>Branch</span>
                      <strong>{bankDetails.branchName || "Not configured"}</strong>
                    </div>
                    <div className="bank-amount-row">
                      <span>Amount to Transfer</span>
                      <strong>{formatPrice(totalAmount)}</strong>
                    </div>
                    <p className="bank-instructions">
                      {bankDetails.instructions || "Please transfer the exact payable amount and provide your transaction details below."}
                    </p>
                  </div>

                  <h5 className="payment-subheading">Your Transfer Information</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Sender's Full Name *</label>
                      <input type="text" name="senderName" className="form-control" placeholder="Name used for bank transfer" value={formData.senderName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sender's Bank Name *</label>
                      <input type="text" name="senderBankName" className="form-control" placeholder="Your bank name" value={formData.senderBankName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sender's Account Title *</label>
                      <input type="text" name="senderAccountTitle" className="form-control" placeholder="Account holder name" value={formData.senderAccountTitle} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last 4 Digits of Account *</label>
                      <input type="text" name="senderAccountLast4" maxLength="4" className="form-control" placeholder="XXXX" value={formData.senderAccountLast4} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Transaction ID / Reference *</label>
                      <input type="text" name="transactionRef" className="form-control" placeholder="Enter transaction reference" value={formData.transactionRef} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Amount Transferred (PKR) *</label>
                      <input type="number" min="1" name="amountTransferred" className="form-control" placeholder="Enter transferred amount" value={formData.amountTransferred} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Date *</label>
                      <input type="date" name="paymentDate" className="form-control" value={formData.paymentDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Time</label>
                      <input type="time" name="paymentTime" className="form-control" value={formData.paymentTime} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Additional Payment Notes</label>
                      <textarea name="paymentNotes" className="form-control" rows="3" placeholder="Any additional information..." value={formData.paymentNotes} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="payment-warning mt-4">
                    <strong>Important:</strong> Your VIP booking will remain pending until the organizer verifies your bank transfer. Do not share your bank password, PIN or OTP.
                  </div>
                </section>
              )}

              {/* ORDER SUMMARY */}
              <section className="order-summary-panel mb-5">
                <div className="section-title-row">
                  <span className="section-number">{isVIP ? "05" : "04"}</span>
                  <div>
                    <h4 className="section-heading">Order Summary</h4>
                    <p className="section-description">Review your booking before confirming.</p>
                  </div>
                </div>
                <div className="summary-line"><span>Event</span><strong>{expo.title}</strong></div>
                <div className="summary-line"><span>Ticket Type</span><strong>{ticketType}</strong></div>
                <div className="summary-line"><span>Quantity</span><strong>{qty}</strong></div>
                <div className="summary-line">
                  <span>Price per ticket</span>
                  <strong>{isVIP ? formatPrice(vipPrice) : "FREE"}</strong>
                </div>
                <div className="summary-total">
                  <span>Total Payable</span>
                  <strong>{isVIP ? formatPrice(totalAmount) : "FREE"}</strong>
                </div>
              </section>

              {/* TERMS */}
              <section className="terms-section mb-4">
                <div className="section-title-row">
                  <span className="section-number">{isVIP ? "06" : "05"}</span>
                  <div>
                    <h4 className="section-heading">Terms & Conditions</h4>
                    <p className="section-description">Please review and accept the following before booking.</p>
                  </div>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required />
                  <label className="form-check-label" htmlFor="terms">I agree to the event's Terms & Conditions. *</label>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" id="privacy" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} required />
                  <label className="form-check-label" htmlFor="privacy">I acknowledge the Privacy Policy. *</label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="updates" checked={updatesAccepted} onChange={(e) => setUpdatesAccepted(e.target.checked)} />
                  <label className="form-check-label" htmlFor="updates">I would like to receive event-related updates.</label>
                </div>
              </section>

              {errorMsg && (
                <div className="booking-error mb-4" role="alert">⚠ {errorMsg}</div>
              )}

              <div className="checkout-footer">
                <div>
                  <span className="total-label">TOTAL AMOUNT</span>
                  <h3 className="total-price">{isVIP ? formatPrice(totalAmount) : "FREE"}</h3>
                  <span className="secure-label">🔒 Secure Registration</span>
                </div>
                <button
                  type="submit"
                  className="btn-gradient checkout-submit"
                  disabled={booking}
                >
                  {booking ? "Processing..." : isVIP ? "SUBMIT VIP BOOKING →" : "CONFIRM FREE BOOKING →"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {modalOpen && successData && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-box">

            <button className="modal-close" onClick={handleCloseModal} aria-label="Close">×</button>

            <div className="text-center mb-4">
              <div className="success-icon mb-3">
                {isVIPPending ? "⏳" : "🎉"}
              </div>

              <span className={`booking-status-pill ${isVIPPending ? "pending" : "confirmed"}`}>
                {isVIPPending ? "PAYMENT VERIFICATION PENDING" : "CONFIRMED"}
              </span>

              <h3 className="fw-bold text-dark mt-3">
                {isVIPPending ? "VIP Booking Submitted!" : "Booking Confirmed!"}
              </h3>

              <p className="text-muted small">
                {isVIPPending
                  ? "Your payment details have been received. Your VIP ticket will be confirmed after the organizer verifies your bank transfer."
                  : `Your free booking has been confirmed for ${expo.title}. A confirmation email has been sent to ${formData.email}.`}
              </p>

              <p className="text-muted small">Redirecting to home in 10 seconds...</p>
            </div>

            <div className="receipt-summary">
              <p><strong>Attendee:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Event:</strong> {expo.title}</p>
              <p><strong>Ticket:</strong> {ticketType}</p>
              <p><strong>Quantity:</strong> {qty}</p>
              <p><strong>Booking Ref:</strong> {bookingReference || "—"}</p>
              <p><strong>Ticket ID:</strong> {ticketId || "—"}</p>
              <p><strong>Total:</strong> {isVIP ? formatPrice(totalAmount) : "FREE"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={isVIPPending ? "text-warning" : "text-success"}>
                  {isVIPPending ? "Pending Payment Verification" : "Confirmed"}
                </span>
              </p>
            </div>

            <button className="btn btn-dark w-100 mt-4 py-3 fw-bold" onClick={() => window.print()}>
              📥 Download Receipt
            </button>

            <button className="btn btn-outline-secondary w-100 mt-2" onClick={handleCloseModal}>
              Go to Homepage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}