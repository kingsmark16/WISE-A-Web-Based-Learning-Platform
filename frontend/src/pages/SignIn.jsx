import { useState } from "react"
import { useGoogleSignInMutation, useSignInMutation, useGoogleSignUpMutation, useSignUpMutation, useVerifyEmailMutation, useResendCodeMutation } from "../hooks/useAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Oval } from 'react-loading-icons'



const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

   

    // Sign In mutations
    const signInMutation = useSignInMutation();
    const googleSignInMutation = useGoogleSignInMutation();

    // Sign Up mutations
    const signUpMutation = useSignUpMutation();
    const verifyMutation = useVerifyEmailMutation();
    const googleSignUpMutation = useGoogleSignUpMutation();
    const resendMutation = useResendCodeMutation();

    // Check if sign up was successful and set pending verification
    if(signUpMutation.isSuccess && !pendingVerification){
        setPendingVerification(true);
    }

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        try {
           await signInMutation.mutateAsync({email, password});
        } catch (error) {
           console.error("Sign in failed:", error);
        }
    }

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        try {
            await signUpMutation.mutateAsync({
                email,
                password,
                firstName,
                lastName
            });
        } catch (error) {
            console.error("Sign up failed", error);
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await googleSignInMutation.mutateAsync();
        } catch (error) {
            console.error('Error in GoogleSignIn', error);
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            await googleSignUpMutation.mutateAsync();
        } catch (error) {
            console.error('Error in GoogleSignUp', error);
        }
    }

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        try {
            await verifyMutation.mutateAsync(verificationCode);
        } catch (error) {
            console.error("Verification failed", error);
        }
    }

    const resetToSignUp = () => {
        setPendingVerification(false);
        setVerificationCode("");
        signUpMutation.reset();
        verifyMutation.reset();
        resendMutation.reset();
    }

    const switchMode = () => {
        setIsSignUp(!isSignUp);
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setVerificationCode("");
        setPendingVerification(false);
        // Reset all mutations
        signInMutation.reset();
        signUpMutation.reset();
        verifyMutation.reset();
        googleSignInMutation.reset();
        googleSignUpMutation.reset();
        resendMutation.reset();
    }

    const errorMessage = signInMutation.error?.message || 
                        signUpMutation.error?.message || 
                        verifyMutation.error?.message || 
                        googleSignInMutation.error?.message || 
                        googleSignUpMutation.error?.message || 
                        resendMutation.error?.message;

    const isLoading = signInMutation.isPending || 
                     signUpMutation.isPending || 
                     verifyMutation.isPending || 
                     googleSignInMutation.isPending || 
                     googleSignUpMutation.isPending || 
                     resendMutation.isPending;

    return (
        <div className="flex justify-center min-h-screen w-full flex-grow items-center px-4 sm:justify-center">
          
            <div className="bg-foreground/10 backdrop-blur-3xl space-y-6 rounded-2xl mx-3 px-6 py-10 sm:w-96 sm:px-8">
                <header className="text-center">
                    <h1 className="mt-4 text-xl font-medium tracking-tight ">
                        {pendingVerification 
                            ? "Verify your email" 
                            : isSignUp 
                                ? "Sign up for WISE" 
                                : "Sign in to WISE"
                        }
                    </h1>
                    {pendingVerification && (
                        <p className="mt-2 text-sm text-muted-foreground">We've sent a verification code to {email}</p>
                    )}
                </header>

                {errorMessage && (
                    <div className="block text-sm text-destructive text-center p-3 rounded-md">
                        {errorMessage}
                    </div>
                )}

                {pendingVerification ? (
                    // Verification Form
                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                        <div>
                            <label htmlFor="verificationCode" className="sr-only">Verification Code</label>
                            <div className="space-y-2 flex items-center justify-between flex-col gap-4">
                              <InputOTP
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                                value={verificationCode}
                                onChange={(value) => setVerificationCode(value)}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                              <div className="text-center text-sm text-muted-foreground">
                               
                                Enter your one-time pin.
                            
                              </div>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-foreground "
                        >
                            {verifyMutation.isPending ? <Oval className="size-5"/> : "Verify Email"}
                        </Button>
                        <div className="text-center space-y-5">
                            <button
                                type="button"
                                onClick={() => resendMutation.mutateAsync()}
                                disabled={resendMutation.isPending}
                                className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50"
                            >
                                {resendMutation.isPending ? <Oval className="size-5"/> : "Didn't receive the code? Resend"}
                            </button>
                            <br />
                            <button
                                type="button"
                                onClick={resetToSignUp}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                ←  Back to sign up
                            </button>
                        </div>
                    </form>
                ) : isSignUp ? (
                    // Sign Up Form
                    <form onSubmit={handleSignUpSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="sr-only">First Name</label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    required
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="sr-only">Last Name</label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    required
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                          
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="Email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                placeholder="Password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                
                                
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full text-foreground "
                            disabled={isLoading}
                        >
                            {signUpMutation.isPending ? <>
                              <Oval className="size-5"/>
                            </> 
                            : "Sign Up"}
                        </Button>
                    </form>
                ) : (
                    // Sign In Form
                    <form onSubmit={handleSignInSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="Email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                placeholder="Password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full text-foreground "
                            disabled={isLoading}
                            
                        >
                            {signInMutation.isPending ? <Oval className="size-5"/> : "Sign In"}
                        </Button>
                    </form>
                )}

                {!pendingVerification && (
                    <div className="rounded-xl p-5">
                        <p className="mb-4 text-center text-sm/5 text-muted-foreground">
                            Alternatively, {isSignUp ? "sign up" : "sign in"} with these platforms
                        </p>
                        <div className="space-y-2 text-center">
                            <Button
                                onClick={isSignUp ? handleGoogleSignUp : handleGoogleSignIn}
                                disabled={isLoading}
                                className="text-foreground bg-background hover:bg-background/60"
                            >
                                {isSignUp ? "Sign up" : "Login"} with Google
                            </Button>
                        </div>
                    </div>
                )}

                {!pendingVerification && (
                    <p className="text-center text-sm text-muted-foreground">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                        <button
                            onClick={switchMode}
                            className="rounded px-1 py-0.5 text-primary outline-none hover:underline"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>
                )}
            </div>
        </div>
    )
}

export default SignIn