import { useState } from "react"
import { useGoogleSignInMutation, useSignInMutation } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";


const SignIn = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const signInMutation = useSignInMutation();
    const googleSignInMutation = useGoogleSignInMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
           await signInMutation.mutateAsync({email, password});
           
        } catch (error) {
           console.error("Sign in failed:", error);
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await googleSignInMutation.mutateAsync();
        } catch (error) {
            console.error('Error in GoogleSignIn', error);
        }
    }

  return (
    <div className="grid w-full flex-grow items-center bg-white px-4 sm:justify-center">
      <div className="w-full space-y-6 rounded-2xl px-4 py-10 sm:w-96 sm:px-8">
        <header className="text-center">
          <h1 className="mt-4 text-xl font-medium tracking-tight text-neutral-950">
            Sign in to WISE
          </h1>
        </header>

        {(signInMutation.error || googleSignInMutation.error) && (
            <div className="block text-sm text-red-600 text-center">
                {signInMutation.error?.message || googleSignInMutation.error?.message}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600"
            />
          </div>
          
          <button
            type="submit"
            disabled={signInMutation.isPending || googleSignInMutation.isPending}
            className="relative w-full rounded-md bg-neutral-600 bg-gradient-to-b from-neutral-500 to-neutral-600 py-1.5 text-sm font-medium text-white shadow-[0_1px_1px_0_theme(colors.white/10%)_inset,0_1px_2.5px_0_theme(colors.black/36%)] outline-none ring-1 ring-inset ring-neutral-600 before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:opacity-0 hover:before:opacity-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:bg-neutral-600 active:text-white/60 active:before:opacity-0 disabled:opacity-50"
          >
            {signInMutation.isPending || googleSignInMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="rounded-xl bg-neutral-100 p-5">
          <p className="mb-4 text-center text-sm/5 text-neutral-500">
            Alternatively, sign in with these platforms
          </p>
          <div className="space-y-2">
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-x-3 rounded-md bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-sm font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 hover:to-neutral-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:text-neutral-950/60"
            >
              Login with Google
            </button>
          </div>
        </div>
        
        <p className="text-center text-sm text-neutral-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/sign-up')}
            className="rounded px-1 py-0.5 text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignIn