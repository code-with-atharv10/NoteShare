import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Sparkles, TrendingUp, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b-4 border-border bg-card">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary/30 rounded-[100%] blur-3xl pointer-events-none rotate-12" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCA0MEwwIDAiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxwYXRoIGQ9Ik00MCAwTDAgMCIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-8 text-sm font-medium rounded-full bg-secondary text-secondary-foreground border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            The academic commons for modern students
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground font-serif leading-[1.1]">
            Stop hoarding notes. <br />
            <span className="text-primary inline-block transform -rotate-2 bg-foreground px-4 py-1 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] mt-2">
              Start sharing them.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            NoteShare is where your brilliant study guides go to help others. 
            Upload your materials, discover what your peers are reading, and ace your classes together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" asChild>
              <Link href="/register">
                Join the Commons <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-card" asChild>
              <Link href="/notes">
                <Search className="ml-2 h-5 w-5 mr-2" /> Browse Notes
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof Section */}
      <section className="py-16 bg-muted border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-2 divide-border">
            <div className="flex flex-col items-center justify-center space-y-2 p-4">
              <span className="text-4xl font-bold text-foreground font-mono">10k+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Students</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 p-4">
              <span className="text-4xl font-bold text-primary font-mono">50k+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes Shared</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 p-4">
              <span className="text-4xl font-bold text-accent font-mono">2M+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Downloads</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 p-4">
              <span className="text-4xl font-bold text-secondary-foreground font-mono">500+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Universities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif">Everything you need to excel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Not just a file dump. A curated library built for learning.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6 shadow-sm border-2 border-border">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Curated Subjects</h3>
              <p className="text-muted-foreground">Find exactly what you need with our organized tag and subject system. No more digging through messy folders.</p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6 shadow-sm border-2 border-border">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trending Materials</h3>
              <p className="text-muted-foreground">Discover the most helpful study guides right before midterms. See what others are finding useful.</p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-6 shadow-sm border-2 border-border">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Peer Recognition</h3>
              <p className="text-muted-foreground">Build your academic reputation. Earn likes, views, and appreciation for helping your classmates succeed.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card py-12 border-t-4 border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-2xl mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>NoteShare</span>
          </div>
          <p className="text-muted-foreground mb-8">The academic commons for modern students.</p>
          <p className="text-sm text-muted-foreground/60 font-mono">© {new Date().getFullYear()} NoteShare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
