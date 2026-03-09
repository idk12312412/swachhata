import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Leaf, Truck, Trophy, ChevronDown, Mail, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import heroBg from "@/assets/hero-bg.jpg";
import logoFull from "@/assets/logo-full.png";

const features = [
  { icon: Camera, title: "Smart Classification", desc: "AI-powered waste sorting with instant results" },
  { icon: Leaf, title: "CO₂ Tracking", desc: "Track your environmental impact in real time" },
  { icon: Truck, title: "Trip Planning", desc: "Know when to visit your recycling center" },
  { icon: Trophy, title: "Community Board", desc: "Compete and climb the eco leaderboard" },
];

const steps = [
  { num: "01", title: "Take a Photo", desc: "Snap a picture of your waste item using your phone or upload an image." },
  { num: "02", title: "AI Classifies It", desc: "Our AI instantly identifies the material and tells you how to sort it." },
  { num: "03", title: "Earn Points", desc: "Get rewarded for every item you classify and track your CO₂ savings." },
  { num: "04", title: "Plan Your Trip", desc: "Find nearby recycling centers and know the best time to visit." },
];

const coreTeam = [
  { name: "Renaya Raut", role: "Team Lead" },
  { name: "Sambhrant Thapa", role: "Backend Developer" },
  { name: "Siya Raj Bhandari", role: "Frontend Developer" },
  { name: "Sukirti Singh", role: "Content Strategist" },
  { name: "Sophia Shrestha", role: "UI/UX Designer" },
];

const devAssociates = [
  "Shaambhav Bhattarai",
  "Abheek Bhakta Pradhan",
  "Bibhushan Bhandari",
  "Shaarav Lal Shrestha",
  "Anshu Kafle",
];

const Home = () => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Navbar */}
    <nav className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4">
      <Logo variant="full" className="h-14 md:h-16 drop-shadow-lg" />
      <Link to="/auth">
        <Button variant="ghost" className="text-white hover:bg-white/10 font-medium">Login</Button>
      </Link>
    </nav>

    {/* Hero */}
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      <motion.div
        className="relative z-10 px-6 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img src={logoFull} alt="Swacchata" className="h-24 md:h-36 mx-auto object-contain drop-shadow-2xl" />
        <h1 className="mt-6 text-4xl md:text-6xl font-display font-extrabold text-white leading-tight tracking-tight">
          For a greener future.
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/80 max-w-xl mx-auto">
          Swacchata helps you classify waste using AI, track your CO₂ savings, and plan smart recycling trips — all while earning points and climbing the community leaderboard.
        </p>
        <div className="mt-8">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="px-10 py-6 text-base font-semibold gap-2 shadow-xl">
              <Leaf className="w-5 h-5" /> Sign Up to Start Recycling
            </Button>
          </Link>
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>

    {/* About */}
    <section id="about" className="px-6 py-20 bg-background">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold text-foreground">About Swacchata</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Swacchata is a community-driven platform built to make waste management smarter and more accessible.
            Using artificial intelligence, we help individuals identify, sort, and recycle their waste properly —
            reducing landfill contributions and tracking the real environmental impact of everyday choices.
            Our mission is simple: empower people to take small actions that add up to a cleaner, greener planet.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="px-6 py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-foreground">Why Swacchata?</h2>
        <p className="mt-2 text-muted-foreground">Smart tools for a sustainable planet</p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-6 text-center"
          >
            <f.icon className="w-10 h-10 mx-auto text-primary mb-4" />
            <h3 className="font-display font-bold text-sm text-card-foreground">{f.title}</h3>
            <p className="text-xs text-muted-foreground mt-2">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* How It Works */}
    <section id="how-it-works" className="px-6 py-20 bg-background">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-foreground">How It Works</h2>
        <p className="mt-2 text-muted-foreground">Four simple steps to make an impact</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-5 rounded-xl border bg-card"
          >
            <span className="text-2xl font-display font-extrabold text-primary shrink-0">{s.num}</span>
            <div>
              <h3 className="font-display font-bold text-card-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Core Team */}
    <section className="px-6 py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-foreground">Our Team</h2>
        <p className="mt-2 text-muted-foreground">The people behind Swacchata</p>
      </div>

      {/* Core */}
      <div className="max-w-4xl mx-auto mb-10">
        <h3 className="text-center text-lg font-display font-semibold text-foreground mb-6">Core Team</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {coreTeam.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-4 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary mb-2">
                {member.name.charAt(0)}
              </div>
              <p className="font-medium text-sm text-card-foreground truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dev Associates */}
      <div className="max-w-4xl mx-auto mb-10">
        <h3 className="text-center text-lg font-display font-semibold text-foreground mb-6">Software Development Associates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {devAssociates.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-4 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground mb-2">
                {name.charAt(0)}
              </div>
              <p className="font-medium text-sm text-card-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground">Development Associate</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Supervisor & Sponsor */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-center text-lg font-display font-semibold text-foreground mb-6">Guidance & Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border bg-card p-5 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-lg font-bold text-accent mb-2">
              R
            </div>
            <p className="font-medium text-sm text-card-foreground">Rabin Shrestha</p>
            <p className="text-xs text-muted-foreground">Supervisor</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-5 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-lg font-bold text-accent mb-2">
              R
            </div>
            <p className="font-medium text-sm text-card-foreground">Rato Bangala School</p>
            <p className="text-xs text-muted-foreground">Sponsor</p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Contact */}
    <section id="contact" className="px-6 py-20 bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold text-foreground">Get in Touch</h2>
          <p className="mt-2 text-muted-foreground">Have questions, feedback, or ideas? We'd love to hear from you.</p>
          <div className="mt-6">
            <a href="mailto:renayaraut2010@gmail.com">
              <Button variant="outline" size="lg" className="gap-2">
                <Mail className="w-5 h-5" /> renayaraut2010@gmail.com
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t bg-card px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo variant="full" className="h-10" />
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Ratobangala Development Team. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
);

export default Home;
