import { type FC, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/app/hooks/use-auth";
import { useToast } from "@/app/services/ui";
import type { LoginDto } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<LoginDto>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await login(formData);
    if (!response.status) {
      showToast(response.error || "Login failed", "error");
      return;
    }

    showToast("Login successful", "success");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full" >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-black hover:underline">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
  );
};
