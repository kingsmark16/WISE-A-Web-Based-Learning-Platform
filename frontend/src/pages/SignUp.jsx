import { useState } from "react"
import { useGoogleSignUpMutation, useResendCodeMutation, useSignUpMutation, useVerifyEmailMutation } from "../hooks/useAuth";
import { BookOpen, Award, Target, Zap, Globe, Users, Sparkles, GraduationCap } from "lucide-react";



const SignUp = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);

   

    const signUpMutation = useSignUpMutation();
    const verifyMutation = useVerifyEmailMutation();
    const googleSignupMutation = useGoogleSignUpMutation();
    const resendMutation = useResendCodeMutation();

    if(signUpMutation.isSuccess && !pendingVerification){
        setPendingVerification(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await signUpMutation.mutateAsync({
                email,
                password,
                firstName,
                lastName
            })
            
        } catch (error) {
            console.error("Sign up failed", error);
        }
    }

    const handleGoogleSignUp = async () => {
      try {
        await googleSignupMutation.mutateAsync();
      } catch (error) {
        console.error('Error in GoogleSignUp', error);
      }
    }

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden transition-colors duration-700">
        {/* Floating Background Elements - Same as LandingPage */}
        <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-element absolute top-26 left-4 sm:top-29 sm:left-10 lg:top-35 lg:left-16 opacity-20 sm:opacity-25 lg:opacity-30 transition-all duration-700">
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-primary" />
        </div>
        <div className="floating-element absolute top-24 right-4 sm:top-32 sm:right-12 md:top-40 md:right-16 lg:top-40 lg:right-20 opacity-15 sm:opacity-20 lg:opacity-25 transition-all duration-700">
          <Award className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary" />
        </div>
        <div className="floating-element absolute bottom-32 left-4 sm:bottom-36 sm:left-8 md:bottom-40 md:left-12 lg:bottom-40 lg:left-20 opacity-20 sm:opacity-25 lg:opacity-30 transition-all duration-700">
          <Target className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-primary" />
        </div>
        <div className="floating-element absolute bottom-16 right-4 sm:bottom-20 sm:right-8 md:bottom-24 md:right-12 lg:bottom-20 lg:right-10 opacity-15 sm:opacity-20 lg:opacity-25 transition-all duration-700">
          <Zap className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-primary" />
        </div>
        <div className="floating-element absolute top-1/2 left-1/6 hidden sm:block md:left-1/5 lg:left-1/4 opacity-10 sm:opacity-15 lg:opacity-20 transition-all duration-700">
          <Globe className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 text-primary" />
        </div>
        <div className="floating-element absolute top-1/3 right-1/6 hidden sm:block md:right-1/5 lg:right-1/4 opacity-10 sm:opacity-15 lg:opacity-20 transition-all duration-700">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-18 xl:w-18 text-primary" />
        </div>
        <div className="floating-element absolute top-3/4 left-1/3 hidden lg:block opacity-10 transition-all duration-700">
          <Sparkles className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
        </div>
        <div className="floating-element absolute top-1/6 right-1/3 hidden lg:block opacity-10 transition-all duration-700">
          <GraduationCap className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
        </div>
      </div>
        <div>
            <header>
                <h1>{pendingVerification ? "Verify your email" : "Sign up for WISE"}</h1>
                {pendingVerification && (
                    <p>We've sent a verification code to {email}</p>
                )}
            </header>

            {(signUpMutation.error || verifyMutation.error || googleSignupMutation.error || resendMutation.error) && (
                <div className="w-full flex justify-center items-center py-2">
                    <div className="max-w-xs w-full bg-red-100 text-red-700 rounded-lg px-4 py-2 text-center text-sm break-words shadow-sm">
                        {signUpMutation.error?.message || verifyMutation.error?.message || googleSignupMutation.error?.message || resendMutation.error?.message}
                    </div>
                </div>
            )}

           {!pendingVerification ? (
            <>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label htmlFor="firstName" className="sr-only">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            required
                            placeholder="First Name"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600"
                        />
                        </div>
                        <div>
                        <label htmlFor="lastName" className="sr-only">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            required
                            placeholder="Last Name"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600"
                        />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                        id="email"
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                        id="password"
                        type="password"
                        required
                        placeholder="Password (min. 8 characters)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        minLength={8}
                        className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={signUpMutation.isPending}
                        className="relative w-full rounded-md bg-blue-600 bg-gradient-to-b from-blue-500 to-blue-600 py-1.5 text-sm font-medium text-white outline-none ring-1 ring-inset ring-blue-600 before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:opacity-0 hover:before:opacity-100 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-600 active:text-white/60 active:before:opacity-0 disabled:opacity-50"
                    >
                        {signUpMutation.isPending ? "Creating account..." : "Sign Up"}
                    </button>
                </form>
                <div className="rounded-xl bg-neutral-100 p-5">
                    <p className="mb-4 text-center text-sm/5 text-neutral-500">
                        Alternatively, sign up with these platforms
                    </p>
                    <div className="space-y-2">
                        <button
                        onClick={handleGoogleSignUp}
                        className="flex w-full items-center justify-center gap-x-3 rounded-md bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-sm font-medium text-neutral-950 outline-none ring-1 ring-black/5 hover:to-neutral-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:text-neutral-950/60"
                        >
                        Sign up with Google
                        </button>
                    </div>
                </div>
                <p className="text-center text-sm text-neutral-500">
                Already have an account?{" "}
                    <button
                        onClick={() => {/* Handle navigation to sign in */}}
                        className="rounded px-1 py-0.5 text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100"
                    >
                        Sign in
                    </button>
                </p>
            </>
           ) : (
            <>
                <form
            onSubmit={e => {
              e.preventDefault()
              verifyMutation.mutateAsync(verificationCode)
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="verificationCode" className="sr-only">Verification Code</label>
              <input
                id="verificationCode"
                type="text"
                required
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full border-b border-neutral-200 bg-white pb-2 text-sm/6 text-neutral-950 outline-none placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-600 text-center tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="relative w-full rounded-md bg-blue-600 bg-gradient-to-b from-blue-500 to-blue-600 py-1.5 text-sm font-medium text-white outline-none ring-1 ring-inset ring-blue-600 before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:opacity-0 hover:before:opacity-100 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-600 active:text-white/60 active:before:opacity-0 disabled:opacity-50"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => resendMutation.mutateAsync()}
                disabled={resendMutation.isPending}
                className="text-sm text-neutral-600 hover:text-neutral-800 underline disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setPendingVerification(false)
                  setVerificationCode("")
                  signUpMutation.reset()
                  verifyMutation.reset()
                  resendMutation.reset()
                }}
                className="text-sm text-neutral-600 hover:text-neutral-800"
              >
                ← Back to sign up
              </button>
            </div>
          </form>
            </>
           )}

        </div>
    </div>
  )
}

export default SignUp