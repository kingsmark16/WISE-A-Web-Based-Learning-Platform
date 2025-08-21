import { useState } from "react"
import { useGoogleSignUpMutation, useResendCodeMutation, useSignUpMutation, useVerifyEmailMutation } from "../hooks/useAuth";



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
    <div>
        <div>
            <header>
                <h1>{pendingVerification ? "Verify your email" : "Sign up for WISE"}</h1>
                {pendingVerification && (
                    <p>We've sent a verification code to {email}</p>
                )}
            </header>

            {(signUpMutation.error || verifyMutation.error || googleSignupMutation.error || resendMutation.error) && (
                <div>
                    {signUpMutation.error?.message || verifyMutation.error?.message || googleSignupMutation.error?.message || resendMutation.error?.message}
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
                        className="relative w-full rounded-md bg-blue-600 bg-gradient-to-b from-blue-500 to-blue-600 py-1.5 text-sm font-medium text-white shadow-[0_1px_1px_0_theme(colors.white/10%)_inset,0_1px_2.5px_0_theme(colors.black/36%)] outline-none ring-1 ring-inset ring-blue-600 before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:opacity-0 hover:before:opacity-100 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-600 active:text-white/60 active:before:opacity-0 disabled:opacity-50"
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
                        className="flex w-full items-center justify-center gap-x-3 rounded-md bg-gradient-to-b from-white to-neutral-50 px-2 py-1.5 text-sm font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 hover:to-neutral-100 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 active:text-neutral-950/60"
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
              className="relative w-full rounded-md bg-blue-600 bg-gradient-to-b from-blue-500 to-blue-600 py-1.5 text-sm font-medium text-white shadow-[0_1px_1px_0_theme(colors.white/10%)_inset,0_1px_2.5px_0_theme(colors.black/36%)] outline-none ring-1 ring-inset ring-blue-600 before:absolute before:inset-0 before:rounded-md before:bg-white/10 before:opacity-0 hover:before:opacity-100 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-600 active:text-white/60 active:before:opacity-0 disabled:opacity-50"
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