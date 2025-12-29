import { type FC, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/app/hooks/use-auth";
import { useToast } from "@/app/services/ui";
import type { RegisterDto } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<RegisterDto>({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    const response = await register(formData);
    if (!response.status) {
      showToast(response.error || "Registration failed", "error");
      return;
    }

    showToast("Registration successful", "success");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-black hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
  );
};
