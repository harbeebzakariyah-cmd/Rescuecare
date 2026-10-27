
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Hospital,
  LocateFixed,
  Menu,
  ShieldCheck,
  Siren,
  Video,
  X,
} from "lucide-react";
import IncidentReport from "./IncidentReport";
import HospitalDashboard from "./HospitalDashboard";

const features = [
  {
    icon: Video,
    title: "Live incident reporting",
    description:
      "Report an incident and capture visual evidence directly through your device.",
  },
  {
    icon: ShieldCheck,
    title: "Incident verification",
    description:
      "Review reports and update their status through the hospital dashboard.",
  },
  {
    icon: LocateFixed,
    title: "Location-aware reports",
    description:
      "Include location coordinates to help identify where an incident occurred.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report an incident",
    description:
      "Choose an incident category, describe what happened, and provide the location.",
  },
  {
    number: "02",
    title: "Save the report",
    description:
      "The report is submitted to the RescueCare backend for storage.",
  },
  {
    number: "03",
    title: "Review the report",
    description:
      "Use the hospital dashboard to review reports and update their status.",
  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navigation = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Report incident", href: "#report" },
    { label: "Hospital dashboard", href: "#hospital-dashboard" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav
          className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <a
            href="#home"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-600 text-white">
              <HeartPulse size={26} />
            </span>

            <span>
              <span className="block text-xl font-extrabold">
                Rescue<span className="text-rose-600">Care</span>
              </span>
              <span className="block text-xs text-slate-500">
                Emergency response platform
              </span>
            </span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-5 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-rose-600"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile navigation */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Homepage hero */}
        <section
          id="home"
          className="scroll-mt-24 bg-gradient-to-br from-rose-50 via-white to-slate-50"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-semibold text-rose-700">
                <Activity size={17} />
                Emergency reporting made simpler
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                When every second matters,{" "}
                <span className="text-rose-600">help starts here.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                RescueCare provides a platform for reporting incidents,
                recording incident details, and managing reports through a
                connected hospital dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#report"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 font-bold text-white transition hover:bg-rose-700"
                >
                  <Siren size={20} />
                  Report an incident
                  <ArrowRight size={18} />
                </a>

                <a
                  href="#hospital-dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Hospital size={19} />
                  Open hospital dashboard
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-600" />
                  Incident reporting
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-600" />
                  Location details
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-600" />
                  Report management
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-white">
                <HeartPulse size={38} />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Connected incident management
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Submit a test report, send it to the backend, and review it
                in the hospital dashboard.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    icon: Video,
                    title: "Report an incident",
                    text: "Provide incident details",
                  },
                  {
                    icon: LocateFixed,
                    title: "Include location",
                    text: "Record available coordinates",
                  },
                  {
                    icon: Hospital,
                    title: "Review the report",
                    text: "Manage status in the dashboard",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <Icon size={22} />
                      </span>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                Student prototype only. This application is not a live
                emergency dispatch service.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-24 border-y border-slate-100 py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-rose-600">
                Platform features
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Tools for incident management
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <Icon size={25} />
                    </span>

                    <h3 className="mt-5 text-lg font-bold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-slate-50 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-rose-600">
                The process
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                How RescueCare works
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-3xl font-black text-rose-200">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Incident report form */}
        <div id="report" className="scroll-mt-24 py-10">
          <IncidentReport />
        </div>

        {/* Hospital portal introduction */}
        <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Hospital size={19} />
                Hospital portal
              </span>

              <h2 className="mt-4 text-3xl font-extrabold">
                Review and manage incident reports
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Open the dashboard to load reports from your backend and
                update their verification status.
              </p>
            </div>

            <a
              href="#hospital-dashboard"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-rose-50"
            >
              Go to dashboard
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

        {/* Actual hospital dashboard component */}
        <HospitalDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="#home"
            className="flex items-center gap-2 font-extrabold"
          >
            <HeartPulse size={23} className="text-rose-600" />
            RescueCare
          </a>

          <p className="text-sm text-slate-500">
            Connecting incident reporting with care.
          </p>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} RescueCare · Student prototype
          </p>
        </div>
      </footer>
    </div>
  );
}
