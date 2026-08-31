"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Menu, X } from "lucide-react";
import { FieldDescription } from "@base-ui/react";

const SCROLL_DURATION_MS = 350;
const SCROLL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const smoothScrollTo = (targetId: string) => {
  const target = document.getElementById(targetId.replace("#", ""));
  if (!target) return;

  const startY = window.scrollY;
  const headerOffset = -50;
  const targetY =
    target.getBoundingClientRect().top + window.scrollY - headerOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1);
    const eased = easeOutCubic(progress);

    window.scrollTo({
      top: startY + distance * eased,
      behavior: "auto",
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const profile = {
  name: "Yamila Lujan Isoardi",
  role: "Abogada",
  city: "Victorica, La Pampa, Argentina",
  /* email: "hola@fojacero.com.ar", */
  /* phone: "+54 9 351 000 0000", */
  image:
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85",
  portrait:
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&w=1000&q=85",
};

const timeline = [
  {
    year: "2018",
    title: "Abogacía",
    detail: "Completar universidad y título de grado.",
  },
  {
    year: "2018",
    title: "Especialización",
    detail: "Agregar posgrado o especialización.",
  },
  {
    year: "2018",
    title: "Experiencia profesional",
    detail: "Agregar estudio, equipo o práctica profesional.",
  },
  {
    year: "Actualidad",
    title: "Foja Cero",
    detail: "Atención personalizada y acompañamiento jurídico.",
  },
];

const specialties = [
  [
    "01",
    "Derecho civil",
    "Acompañamiento en vínculos, obligaciones y situaciones de la vida cotidiana.",
  ],
  [
    "02",
    "Derecho de familia",
    "Una mirada clara y cuidadosa para momentos que necesitan especial atención.",
  ],
  [
    "03",
    "Derecho laboral",
    "Orientación para comprender derechos, acuerdos y próximos pasos.",
  ],
  [
    "04",
    "Sucesiones",
    "Orden y sensibilidad para transitar procesos familiares importantes.",
  ],
  [
    "05",
    "Contratos",
    "Revisión y redacción de acuerdos pensados para cada situación.",
  ],
  [
    "06",
    "Asesoramiento jurídico",
    "Un espacio para conversar, evaluar alternativas y decidir con información.",
  ],
];

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [contactError, setContactError] = useState("");
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contactFormRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const cancelConsentButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const isContactSubmittingRef = useRef(false);

  const navItems = [
    { label: "Sobre mí", href: "#sobre-mi" },
    { label: "Formación", href: "#formacion" },
    { label: "Especialidades", href: "#especialidades" },
    { label: "Forma de Trabajo", href: "#formadetrabajo" },
    { label: "Hablemos", href: "#hablemos" },
  ];

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    closeMenu();
    smoothScrollTo(href);
  };

  useEffect(() => {
    if (!isConsentModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelConsentButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isConsentModalOpen]);

  const submitContactForm = async (form: HTMLFormElement) => {
    if (isContactSubmittingRef.current) return;

    isContactSubmittingRef.current = true;
    setContactStatus("submitting");
    setContactError("");

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          result?.error || "No se pudo enviar la consulta. Intentá más tarde.",
        );
      }

      form.reset();
      setContactStatus("success");
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la consulta. Intentá más tarde.",
      );
      setContactStatus("error");
    } finally {
      isContactSubmittingRef.current = false;
    }
  };

  const handleContactSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (isContactSubmittingRef.current) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIsConsentModalOpen(true);
  };

  const closeConsentModal = () => {
    setIsConsentModalOpen(false);
    requestAnimationFrame(() => {
      const previousElement = previouslyFocusedElementRef.current;
      if (previousElement?.isConnected) {
        previousElement.focus();
      } else {
        submitButtonRef.current?.focus();
      }
    });
  };

  const handleConsentKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeConsentModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled)",
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) return;

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const confirmConsentAndSubmit = () => {
    const form = contactFormRef.current;
    if (!form || isContactSubmittingRef.current) return;

    setIsConsentModalOpen(false);
    void submitContactForm(form);
  };

  return (
    <main className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#inicio"
          onClick={closeMenu}
          aria-label="Foja Cero, inicio"
        >
          <span className="brand-mark">F</span>
          <span>Foja Cero</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Navegación principal"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(event) => handleNavClick(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          {/* <a className="nav-cta" href="#hablemos" onClick={closeMenu}>
            Hablemos <ArrowUpRight size={15} />
          </a> */}
        </nav>
      </header>

      <section id="inicio" className="hero section-pad">
        <div className="hero-copy reveal-up">
          <p className="eyebrow">
            <span /> Estudio jurídico independiente
          </p>
          <h1>
            El Derecho, <em>con otra mirada.</em>
          </h1>
          <br />
          <p /* className="hero-lede" */ className="serif-copy">
            Soy {profile.name}, abogada. En Foja Cero creo espacios de confianza
            para entender cada situación y encontrar el camino más claro. <br />
          </p>
          <br />
          <div className="button-row">
            <a href="#formacion" className="button button-primary">
              Conocé mi trayectoria <ArrowUpRight size={17} />
            </a>
            <a href="#hablemos" className="button button-text">
              Realizar una consulta <span>→</span>
            </a>
          </div>
          <p className="hero-location">
            {profile.city} <span>·</span> Atención presencial y online
          </p>
        </div>
        <div className="hero-image-wrap reveal-up delay-1">
          <img
            src={profile.image}
            alt="Fotografía profesional provisional de la abogada"
            className="hero-image"
          />
          <div className="image-caption">
            <span>Foja Cero</span>
            <span>Desde 2018</span>
          </div>
          <div className="hero-stamp">
            FC<span>°</span>
          </div>
        </div>
      </section>

      <section id="sobre-mi" className="about section-pad section-dark">
        <div className="section-label light-label">
          01 <span>Sobre mí</span>
        </div>
        <div className="about-grid">
          <div className="about-image-wrap">
            <img
              src={profile.portrait}
              alt="Retrato profesional provisional"
              className="about-image"
            />
            <span className="vertical-note">PERSONA · ESCUCHA · DERECHO</span>
          </div>
          <div className="about-copy">
            <p className="eyebrow copper">
              <span /> Una práctica más humana
            </p>
            <h2>
              Antes que un caso,
              <br />
              <em>una persona.</em>
            </h2>
            <br />
            <div className="serif-copy-2">
              <p className="serif-copy">
                Creo que el derecho puede ser riguroso sin perder cercanía. Mi
                trabajo empieza en la escucha: en entender qué te preocupa, qué
                necesitás y qué alternativas existen.
              </p>
              <br />
              <p className="serif-copy">
                Foja Cero nace para ofrecer un acompañamiento atento, claro y
                personalizado. Sin fórmulas, sin promesas vacías: con
                información para que puedas tomar decisiones con tranquilidad.
              </p>
            </div>
            <a href="#formadetrabajo" className="inline-link">
              Conocé mi forma de trabajar <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section id="formacion" className="timeline-section section-pad">
        <div className="section-label">
          02 <span>Formación y trayectoria</span>
        </div>
        <div className="section-intro">
          <h2>
            Un recorrido en <em>construcción.</em>
          </h2>
          <div className="serif-copy-">
            <p /* className="serif-copy-3" */>
              La formación es un camino que se transforma con cada experiencia.
              {/* Estos datos son editables y están listos para completar. */}
            </p>
          </div>
        </div>
        <div className="timeline">
          {timeline.map((item, index) => (
            <div className="timeline-item" key={item.title}>
              <div className="timeline-year">{item.year}</div>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <span className="timeline-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="credentials">
          <span>Universidad Nacional de La Pampa (UNLPam) <br /> Matrícula profesional: 
            Abogado: T° XII F° 26, 
            Procurador: T° VII F° 40.
          </span>
        </div> */}
      </section>
      <section
        id="especialidades"
        className="specialties section-pad section-paper"
      >
        <div className="section-label">
          03 <span>Especialidades</span>
        </div>
        <div className="section-intro">
          <h2>
            Lo que hacemos,
            <br />
            <em>con claridad.</em>
          </h2>
          <p>
            Un primer acercamiento para entender cómo puedo acompañarte. Cada
            consulta merece una mirada propia.
          </p>
        </div>
        <div className="specialty-grid">
          {specialties.map(([number, title, text]) => (
            <article className="specialty-card" key={title}>
              <span className="card-number">{number}</span>
              <ChevronDown size={19} className="card-arrow" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="formadetrabajo" className="process section-pad">
        <div className="section-label">
          04 <span>Forma de trabajo</span>
        </div>
        <div className="process-head">
          <h2>
            Un proceso simple,
            <br />
            <em>paso a paso.</em>
          </h2>
          <p>
            La claridad también es una forma de cuidado. Te acompaño para que
            sepas dónde estás y hacia dónde podés ir.
          </p>
        </div>
        {/*  <div className="process-list">
          {[
            "Primera consulta",
            "Evaluación del caso",
            "Definición de la estrategia",
            "Acompañamiento y seguimiento",
          ].map((step, i) => (
            <div className="process-step" key={step}>
              <span>0{i + 1}</span>
              <h3>{step}</h3>
              <ArrowUpRight size={18} />
            </div>
          ))}
        </div> */}
        <div className="process-list">
          {[
            {
              title: "Primera consulta",
              description:
                "En este primer encuentro vas a poder contarme tu situación, plantear tus dudas y compartir la información que consideres importante. La idea es conocer el caso y brindarte una orientación inicial clara.",
            },
            {
              title: "Evaluación del caso",
              description:
                "Voy a analizar la información y la documentación disponible para identificar las alternativas legales posibles y explicarte los pasos que podrían seguirse.",
            },
            {
              title: "Definición de la estrategia",
              description:
                "Una vez evaluado el caso, definiremos el camino más adecuado según tus necesidades y objetivos, considerando las distintas opciones disponibles.",
            },
            {
              title: "Acompañamiento y seguimiento",
              description:
                "Durante todo el proceso vas a recibir información clara sobre el avance del caso y los pasos siguientes. También podrás realizar las consultas que necesites en cada etapa.",
            },
          ].map((step, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`process-item ${isOpen ? "is-open" : ""}`}
                key={step.title}
              >
                <button
                  type="button"
                  className="process-step"
                  onClick={() =>
                    setOpenIndex((current) =>
                      current === index ? null : index,
                    )
                  }
                  aria-expanded={isOpen}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <ChevronDown
                    className="process-arrow"
                    size={18}
                    aria-hidden="true"
                  />
                </button>

                <div className="process-content" aria-hidden={!isOpen}>
                  <div className="process-content-inner">
                    <p className="process-description">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="hablemos" className="contact section-pad section-dark">
        <div className="section-label light-label">
          05 <span>Contacto</span>
        </div>
        <div className="contact-grid">
          <div className="contact-copy">
            <p className="eyebrow copper">
              <span /> Abramos la conversación
            </p>
            <h2>
              Hablemos sobre
              <br />
              <em>tu consulta.</em>
            </h2>
            <p>
              {/* Contame brevemente qué necesitás. Voy a leer tu mensaje y
              responderte para coordinar un primer encuentro. */}
              Contame brevemente en qué puedo ayudarte. Voy a leer tu mensaje y
              responderte para que coordinemos un primer encuentro. <br />
              El horario de atención es de lunes a viernes, de 8:00 a 13:00 y de
              16:30 a 20:00; y los sábados, de 9:00 a 13:00.
            </p>
            <div className="contact-details">
              {/* <a href={`mailto:${profile.email}`}>{profile.email}</a> */}
              {/* <a href={`tel:${profile.phone}`}>{profile.phone}</a> */}
              Calle 17 N° 459
              <span>{profile.city}</span>
            </div>
          </div>
          
          <form
            ref={contactFormRef}
            className="contact-form"
            onSubmit={handleContactSubmit}
            aria-label="Formulario de consulta"
          >
            {contactStatus === "success" ? (
              <div className="success-state">
                <span className="success-icon">
                  <Check size={22} />
                </span>
                <h3>Mensaje recibido.</h3>
                <p>Gracias por escribirme. Te voy a responder a la brevedad.</p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setContactStatus("idle")}
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : contactStatus === "submitting" ? (
              <div
                className="loading-state"
                role="status"
                aria-live="polite"
              >
                <span className="loader" aria-hidden="true" />
                <p>Enviando consulta…</p>
              </div>
            ) : (
              <>
                <label>
                  Nombre y apellido
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="¿Cómo te llamás?"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Correo electrónico
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      maxLength={254}
                      placeholder="tu@email.com"
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      maxLength={40}
                      placeholder="Tu teléfono"
                    />
                  </label>
                </div>
                <label>
                  Mensaje
                  <textarea
                    required
                    name="message"
                    rows={4}
                    minLength={10}
                    maxLength={4000}
                    placeholder="¿En qué puedo ayudarte?"
                  />
                </label>
                <label aria-hidden="true" style={{ display: "none" }}>
                  Sitio web
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
                {contactStatus === "error" && (
                  <p className="form-note" role="alert">
                    {contactError}
                  </p>
                )}
                <button
                  ref={submitButtonRef}
                  className="button button-copper"
                  type="submit"
                >
                  Enviar consulta <ArrowUpRight size={17} />
                </button>
                <p className="form-note">
                  Tus datos serán utilizados únicamente para gestionar tu
                  consulta.
                </p>
              </>
            )}
          </form>
        </div>
      </section>
      
      {/* Consentimiento de Consulta, politicas del estudio */}

      {isConsentModalOpen && (
        <div className="consent-modal-overlay">
          <div
            className="consent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-modal-title"
            aria-describedby="consent-modal-description"
            onKeyDown={handleConsentKeyDown}
          >
            <p className="consent-modal-eyebrow">Foja Cero</p>
            <h2 id="consent-modal-title">Antes de enviar tu consulta</h2>
            <p id="consent-modal-description">
              Para poder responderte, Foja Cero necesita utilizar los datos
              personales que proporcionaste en este formulario.
            </p>
            <p>
              Al continuar, confirmás que leíste y aceptás el tratamiento de
              tus datos para gestionar y responder esta consulta.
            </p>
            <div className="consent-modal-actions">
              <button
                ref={cancelConsentButtonRef}
                className="button consent-modal-cancel"
                type="button"
                onClick={closeConsentModal}
              >
                Cancelar
              </button>
              <button
                className="button button-copper consent-modal-confirm"
                type="button"
                onClick={confirmConsentAndSubmit}
              >
                Aceptar y enviar <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark">F</span>
          <span>Foja Cero</span>
        </div>
        <p>
          {profile.name}
          <br />
          Abogada {/* · {profile.city} */}
        </p>
        <p className="footer-legal">
          Matrícula profesional: Abogado: T° XII F° 26, Procurador: T° VII F°
          40.
        </p>
        <p className="footer-legal">
          {profile.city}
          {/* <div className="footer-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href="https://www.instagram.com/fojacero.sj/">Instagram ↗</a>
          <a href="#">LinkedIn ↗</a>
        </div> */}
          <br />© 2026 Foja Cero
        </p>
        <div></div>
      </footer>
    </main>
  );
}
