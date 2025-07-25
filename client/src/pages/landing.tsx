import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SharedNavigation } from "@/components/shared-navigation";
import { Heart, Users, Calendar, BarChart3, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SharedNavigation />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Track Your Emotional Journey
            <span className="block text-primary">Together</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            A collaborative journaling platform for individuals, couples, and groups to track emotional patterns, 
            important conversations, and meaningful moments with timestamped entries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
            >
              Start Journaling Free
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <Card className="glass shadow-ios hover:shadow-ios-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emotional Tracking</h3>
              <p className="text-slate-600">
                Track your emotions, triggers, and responses with intelligent tagging and pattern recognition.
              </p>
            </CardContent>
          </Card>

          <Card className="glass shadow-ios hover:shadow-ios-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Group Collaboration</h3>
              <p className="text-slate-600">
                Create groups for couples, families, or support networks to share experiences and insights.
              </p>
            </CardContent>
          </Card>

          <Card className="glass shadow-ios hover:shadow-ios-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timeline Views</h3>
              <p className="text-slate-600">
                Visualize your journey with timeline and calendar views showing entries and emotional patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="glass shadow-ios hover:shadow-ios-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insights & Analytics</h3>
              <p className="text-slate-600">
                Discover patterns and trends in your emotional well-being with detailed analytics and insights.
              </p>
            </CardContent>
          </Card>

          <Card className="glass shadow-ios hover:shadow-ios-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy & Security</h3>
              <p className="text-slate-600">
                Your thoughts are protected with enterprise-grade security and granular privacy controls.
              </p>
            </CardContent>
          </Card>

          <Card className="glass shadow-ios hover:shadow-ios-xl transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Features</h3>
              <p className="text-slate-600">
                Rich text editing, mood tracking, tag suggestions, and conflict resolution templates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <Card className="max-w-2xl mx-auto glass shadow-ios-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-slate-600 mb-6">
                Join thousands of people already using MindSync to improve their emotional well-being and strengthen relationships.
              </p>
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
              >
                Get Started for Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
