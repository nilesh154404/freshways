import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoginProps {
  setToken: (token: string) => void;
}

interface LoginResponse {
  accessToken: string;
  role: string;
  profileId: number;
}

export default function Login({ setToken }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post<LoginResponse>(
        "http://localhost:3064/auth/login",
        { username, password }
      );

      const { accessToken, role, profileId } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("role", role);
      localStorage.setItem("profileId", profileId.toString());

      setToken(accessToken);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center">Freshwayz</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Login to your dashboard
        </p>

        <div className="space-y-4">
          <Input
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">New vendor?</span>{" "}
          <Link
            to="/vendor/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Create a vendor account
          </Link>
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// interface LoginProps {
//     setToken: (token: string) => void;
// }
// interface LoginResponse {
//     accessToken: string;
//     role: string;
//     profileId: number;
// }

// const Login = ({ setToken }: LoginProps) => {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleLogin = async () => {
//         try {
//             setLoading(true);

//             const response = await axios.post<LoginResponse>(
//                 "http://localhost:3064/auth/login",
//                 {
//                     username,
//                     password,
//                 }
//             );

//             const { accessToken, role, profileId } = response.data;


//             // Store auth data
//             localStorage.setItem("accessToken", accessToken);
//             localStorage.setItem("role", role);
//             localStorage.setItem("profileId", profileId.toString());

//             setToken(accessToken);

//             toast.success("Login successful");
//             navigate("/", { replace: true });
//         } catch (error) {
//             console.error(error);
//             toast.error("Invalid username or password");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-50">
//             <div className="w-full max-w-md p-6 border rounded-lg bg-white shadow">
//                 <h2 className="text-2xl font-bold mb-4 text-center">Freshways Login</h2>

//                 <Input
//                     placeholder="Username"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     className="mb-3"
//                 />

//                 <Input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="mb-4"
//                 />

//                 <Button
//                     className="w-full"
//                     onClick={handleLogin}
//                     disabled={loading}
//                 >
//                     {loading ? "Logging in..." : "Login"}
//                 </Button>
//                 <p className="text-center text-sm text-gray-600">
//                     Are you a vendor?{" "}
//                     <Link
//                         to="/vendor/signup"
//                         className="text-blue-600 hover:underline font-medium"
//                     >
//                         Sign up here
//                     </Link>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default Login;
