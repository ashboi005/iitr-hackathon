"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Briefcase, HandCoins, Shield, User, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import router, { Router } from 'next/router';
import { useRouter } from 'next/navigation';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
 

  const router = useRouter(); // ✅ Initialize router properly
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList[isDarkMode ? 'add' : 'remove']('dark');
  }, [isDarkMode]);



  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full" />
            <span className="text-xl font-bold">Workify</span>
          </div>
          
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 container mx-auto px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-5xl font-bold mb-6 leading-tight"
          >
            Decentralized Talent Marketplace
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Secure freelance collaborations powered by blockchain smart contracts
          </motion.p>
          <Button 
      onClick={() => router.push('/sign-in')}
      className="mt-4"
    >
      Getting Started
    </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Why Choose Workify
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-8 rounded-xl bg-card border"
              >
                <feature.icon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simple three-step process for secure collaborations
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-8 rounded-xl bg-card border"
            >
              <div className="h-12 w-12 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Shield,
    title: "Secure Escrow",
    description: "Funds protected by smart contracts until work is verified"
  },
  {
    icon: BadgeCheck,
    title: "Transparent History",
    description: "Immutable transaction records on the blockchain"
  },
  {
    icon: HandCoins,
    title: "Fair Resolution",
    description: "Decentralized dispute arbitration system"
  }
];

const steps = [
  {
    title: "Create Profile",
    description: "Set up your professional profile in minutes"
  },
  {
    title: "Start Contract",
    description: "Agree on terms and fund escrow securely"
  },
  {
    title: "Work & Get Paid",
    description: "Collaborate safely and receive payments automatically"
  }
];