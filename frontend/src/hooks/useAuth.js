import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

//SignIn

export const useSignInMutation = () => {
   const {signIn, setActive} = useSignIn();
   const navigate = useNavigate();

   return useMutation({
    mutationFn: async ({email, password}) => {
        const result = await signIn.create({
            identifier: email,
            password
        })

        if(result.status === "complete"){
            await setActive({session: result.createdSessionId})
            return result
        }
    },
    onSuccess: () => {
      navigate('/auth-callback');
    },
    onError: (error) => {
      console.error('Sign in error:', error)
    }
   })
}

export const useGoogleSignInMutation = () => {
    const {signIn} = useSignIn();

    return useMutation({
        mutationFn: async () => {
           await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/auth-callback'
            })
            
        },
        onError: (error) => {
            console.error('Google sign in error', error);
        }
    })
}


//SignUp

export const useSignUpMutation = () => {
    const {signUp} = useSignUp();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({email, password, firstName, lastName}) => {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName
            })
            await signUp.prepareEmailAddressVerification({strategy: 'email_code'});
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
        onError: (error) => {
            console.error("Sign Up failed", error)
        }
    })
}

export const useVerifyEmailMutation = () => {
    const {signUp, setActive} = useSignUp();

    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (code) => {
            const completeSignUp = await signUp.attemptEmailAddressVerification({code});

            if(completeSignUp.status === 'complete'){
                await setActive({session: completeSignUp.createdSessionId});
                return completeSignUp;
            } else {
                throw new Error("Verification failed. Please try again");
            }
        },
        onSuccess: () => {
            navigate('/auth-callback');
        },
        onError: (error) => {
            console.error("Email verification error", error);
        }
    })
}

export const useGoogleSignUpMutation = () => {
    const {signUp} = useSignUp();

    return useMutation({
        mutationFn: async () => {
            await signUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/auth-callback'
            })
        },
        onError: (error) => {
            console.error('Google sign up error', error);
        }
    })
}

export const useResendCodeMutation = () => {
    const {signUp} = useSignUp();

    return useMutation({
        mutationFn: async () => {
            await signUp.prepareEmailAddressVerification({strategy: 'email_code'});
        },
        onError: (error) => {
            console.error("Resend code error", error);
        }
    })
}

//Sync to the database

export const useSyncUser = () => {
    const {user, isLoaded} = useUser();

    return useQuery({
        queryKey: [
            'auth-callback',
            user,
        ],
        queryFn: async () => {
            if(!user) throw new Error('No user found');

            const response = await axiosInstance.post('/auth/callback', {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailAddress: user.emailAddresses[0]?.emailAddress,
                imageUrl: user.imageUrl
            });

            return response.data;
        },
        enabled: isLoaded && !!user,
        retry: 2,
        staleTime: Infinity,
    })
}