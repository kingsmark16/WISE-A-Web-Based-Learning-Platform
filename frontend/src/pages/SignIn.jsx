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
        <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-screen md:min-h-screen lg:h-screen lg:overflow-hidden">
          {/* Floating background elements for visual interest */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          </div>

          {/* Main Container */}
          <div className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg">
            {/* Card */}
            <div className="bg-background/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
              
              {/* Header */}
              <header className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                  {pendingVerification 
                    ? "Verify Email" 
                    : isSignUp 
                      ? "Create Account" 
                      : "Welcome Back"
                  }
                </h1>
                {pendingVerification && (
                  <p className="text-sm sm:text-base text-muted-foreground pt-2">
                    We sent a code to <span className="font-medium text-foreground">{email}</span>
                  </p>
                )}
                {!pendingVerification && (
                  <p className="text-sm sm:text-base text-muted-foreground pt-2">
                    {isSignUp 
                      ? "Join thousands of learners today" 
                      : "Sign in to your account"
                    }
                  </p>
                )}
              </header>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm sm:text-base p-3 sm:p-4 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Forms */}
              {pendingVerification ? (
                // Verification Form
                <form onSubmit={handleVerifyEmail} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-foreground">
                      Verification Code
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        value={verificationCode}
                        onChange={(value) => setVerificationCode(value)}
                      >
                        <InputOTPGroup className="gap-2 sm:gap-3">
                          <InputOTPSlot index={0} className="h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl" />
                          <InputOTPSlot index={1} className="h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl" />
                          <InputOTPSlot index={2} className="h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl" />
                          <InputOTPSlot index={3} className="h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl" />
                          <InputOTPSlot index={4} className="h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl" />
                          <InputOTPSlot index={5} className="h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full h-10 sm:h-11 text-base sm:text-lg font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {verifyMutation.isPending ? (
                      <><Oval className="size-5" /></>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => resendMutation.mutateAsync()}
                      disabled={resendMutation.isPending}
                      className="w-full text-sm text-primary hover:text-primary/80 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendMutation.isPending ? "Resending..." : "Didn't get a code? Resend"}
                    </button>
                    <button
                      type="button"
                      onClick={resetToSignUp}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Back to Sign Up
                    </button>
                  </div>
                </form>
              ) : isSignUp ? (
                // Sign Up Form
                <form onSubmit={handleSignUpSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-10 sm:h-11 text-sm sm:text-base rounded-lg border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-10 sm:h-11 text-sm sm:text-base rounded-lg border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 sm:h-11 text-sm sm:text-base rounded-lg border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 sm:h-11 text-sm sm:text-base rounded-lg border-border/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 text-base sm:text-lg font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
                    disabled={isLoading}
                  >
                    {signUpMutation.isPending ? (
                      <Oval className="size-5" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              ) : (
                // Sign In Form
                <form onSubmit={handleSignInSubmit} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 sm:h-11 text-sm sm:text-base rounded-lg border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 sm:h-11 text-sm sm:text-base rounded-lg border-border/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 text-base sm:text-lg font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
                    disabled={isLoading}
                  >
                    {signInMutation.isPending ? (
                      <Oval className="size-5" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              )}

              {!pendingVerification && (
                <>
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <Button
                    onClick={isSignUp ? handleGoogleSignUp : handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium rounded-lg bg-background/50 border border-border/50 text-foreground hover:bg-background/80 hover:border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign {isSignUp ? "up" : "in"} with Google
                  </Button>

                  {/* Toggle Mode */}
                  <p className="text-center text-sm sm:text-base text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                    <button
                      onClick={switchMode}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </>
              )}
            </div>

          </div>
        </div>
    )
}

export default SignIn