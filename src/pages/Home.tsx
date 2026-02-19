import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Leaf, Truck, Trophy, ChevronDown } from "lucide-react";
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

const team = [
  { name: "Renaya Raut", role: "Team Lead" },
  { name: "Sambhrant Thapa", role: "Backend Developer" },
  { name: "Siya Raj Bhandari", role: "Frontend Developer" },
  { name: "Sukirti Singh", role: "Content Strategist" },
  { name: "Sophia Shrestha", role: "UI/UX Designer" },
  { name: "Rabin Shrestha", role: "Supervisor" },
  { name: "Rato Bangala School", role: "Sponsor" },
  { name: "Member 8", role: "Team Member" },
  { name: "Member 9", role: "Team Member" },
  { name: "Member 10", role: "Team Member" },
];

const Home = () => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Minimal Navbar */}
    <nav className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4">
      <Logo variant="full" className="h-10 md:h-12 drop-shadow-lg" />
      <Link to="/auth">
        <Button variant="ghost" className="text-white hover:bg-white/10 font-medium">Login</Button>
      </Link>
    </nav>

    {/* Hero Section */}
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      <motion.div
        className="relative z-10 px-6 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img src={logoFull} alt="Swacchata" className="h-20 md:h-32 mx-auto object-contain drop-shadow-2xl" />
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

    {/* Features */}
    <section className="px-6 py-20 bg-background">
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

    {/* Team */}
    <section className="px-6 py-20 bg-muted/50">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-foreground">Our Team</h2>
        <p className="mt-2 text-muted-foreground">The people behind Swacchata</p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {team.map((member, i) => (
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
    </section>

    {/* Footer */}
    <footer className="border-t bg-card px-6 py-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo variant="full" className="h-8" />
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
          <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© Ratobangala Development Team</p>
      </div>
    </footer>
  </div>
);

export default Home;
