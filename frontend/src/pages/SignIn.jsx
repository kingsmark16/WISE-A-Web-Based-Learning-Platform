import { useState } from "react"
import { useGoogleSignInMutation, useSignInMutation, useGoogleSignUpMutation, useSignUpMutation, useVerifyEmailMutation, useResendCodeMutation } from "../hooks/useAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Oval } from 'react-loading-icons'
import { BookOpen, Award, Target, Zap, Globe, Users, Sparkles, GraduationCap } from "lucide-react"



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
        <div className="h-screen w-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden relative flex items-center justify-center">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[10%] left-[5%] sm:left-[10%] opacity-20">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
            </div>
            <div className="absolute top-[15%] right-[10%] opacity-15">
              <Award className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
            </div>
            <div className="absolute bottom-[20%] left-[8%] opacity-20">
              <Target className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
            </div>
            <div className="absolute bottom-[15%] right-[12%] opacity-15">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            </div>
            <div className="absolute top-1/2 left-[15%] hidden md:block opacity-10">
              <Globe className="h-20 w-20 text-primary" />
            </div>
            <div className="absolute top-[30%] right-[20%] hidden md:block opacity-10">
              <Users className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute bottom-[10%] left-[30%] hidden lg:block opacity-10">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute top-[10%] right-[30%] hidden lg:block opacity-10">
              <GraduationCap className="h-14 w-14 text-primary" />
            </div>
          </div>

          {/* Main Card */}
          <div className="relative z-10 w-full max-w-[400px] sm:max-w-[440px] px-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-background/60 dark:bg-background/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/20 dark:border-white/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-hide flex flex-col gap-5 transition-all duration-300">
              
              {/* Header */}
              <header className="text-center space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {pendingVerification 
                    ? "Verify Email" 
                    : isSignUp 
                      ? "Create Account" 
                      : "Welcome Back"
                  }
                </h1>
                <p className="text-sm text-muted-foreground">
                  {pendingVerification 
                    ? <span className="block truncate">Code sent to <span className="font-medium text-foreground">{email}</span></span>
                    : isSignUp 
                      ? "Enter your details to get started" 
                      : "Enter your credentials to access your account"
                  }
                </p>
              </header>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl text-center animate-in slide-in-from-top-2">
                  {errorMessage}
                </div>
              )}

              {/* Forms */}
              {pendingVerification ? (
                // Verification Form
                <form onSubmit={handleVerifyEmail} className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        value={verificationCode}
                        onChange={(value) => setVerificationCode(value)}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-lg border-primary/20 bg-background/50" />
                          <InputOTPSlot index={1} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-lg border-primary/20 bg-background/50" />
                          <InputOTPSlot index={2} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-lg border-primary/20 bg-background/50" />
                          <InputOTPSlot index={3} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-lg border-primary/20 bg-background/50" />
                          <InputOTPSlot index={4} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-lg border-primary/20 bg-background/50" />
                          <InputOTPSlot index={5} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-lg border-primary/20 bg-background/50" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full h-11 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300"
                  >
                    {verifyMutation.isPending ? (
                      <Oval className="size-5" stroke="currentColor" />
                    ) : (
                      "Verify Email"
                    )}
                  </Button>

                  <div className="flex flex-col gap-2 text-center pt-1">
                    <button
                      type="button"
                      onClick={() => resendMutation.mutateAsync()}
                      disabled={resendMutation.isPending}
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                    >
                      {resendMutation.isPending ? "Resending..." : "Resend Code"}
                    </button>
                    <button
                      type="button"
                      onClick={resetToSignUp}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back to Sign Up
                    </button>
                  </div>
                </form>
              ) : isSignUp ? (
                // Sign Up Form
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground ml-1">First Name</label>
                      <Input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-10 rounded-xl bg-background/50 border border-foreground/30 focus:border-primary focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground ml-1">Last Name</label>
                      <Input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-10 rounded-xl bg-background/50 border border-foreground/30 focus:border-primary focus:bg-background transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-xl bg-background/50 border border-foreground/30 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                    <Input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 rounded-xl bg-background/50 border border-foreground/30 focus:border-primary focus:bg-background transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground ml-1">Min. 8 characters</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 mt-2"
                    disabled={isLoading}
                  >
                    {signUpMutation.isPending ? (
                      <Oval className="size-5" stroke="currentColor" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              ) : (
                // Sign In Form
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
                    <Input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl bg-background/50 border border-foreground/30 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-medium text-muted-foreground">Password</label>
                    </div>
                    <Input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl bg-background/50 border border-foreground/30 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 mt-2"
                    disabled={isLoading}
                  >
                    {signInMutation.isPending ? (
                      <Oval className="size-5" stroke="currentColor" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              )}

              {!pendingVerification && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/40"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-muted-foreground backdrop-blur-xl">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={isSignUp ? handleGoogleSignUp : handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-border transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    Continue with Google
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                    <button
                      onClick={switchMode}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    )
}

export default SignIn