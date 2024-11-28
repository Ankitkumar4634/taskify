'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6)
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const form = useForm<RegisterFormValues | LoginFormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: { username: '', email: '', password: '' }
  });

  const handleRegister = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const { message } = await res.json();
        console.error('Error:', message);
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: (
          <>
            <CheckCircle className="mr-2 inline-block text-green-500" />{' '}
            Registration successful! You can now log in.
          </>
        )
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: (
          <>
            <XCircle className="mr-2 inline-block text-red-500" /> An error
            occurred: {err}
          </>
        )
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const { message } = await res.json();
        console.error('Login failed:', message);
        setLoading(false);
        toast({
          title: 'Error',
          description: (
            <>
              <XCircle className="mr-2 inline-block text-red-500" /> Login
              failed: {message}
            </>
          )
        });
        return;
      }

      const { email, username, userId } = await res.json();

      const result = await signIn('credentials', {
        email,
        username,
        userId,
        password: data.password,
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (result?.ok) {
        router.push('/dashboard');
        toast({
          title: 'Success',
          description: (
            <>
              <CheckCircle className="mr-2 inline-block text-green-500" /> Login
              successful!
            </>
          )
        });
      } else {
        console.error('Login failed:', result?.error);
        toast({
          title: 'Error',
          description: (
            <>
              <XCircle className="mr-2 inline-block text-red-500" /> Login
              failed: {result?.error}
            </>
          )
        });
      }
    } catch (err) {
      console.error('An error occurred:', err);
      toast({
        title: 'Error',
        description: (
          <>
            <XCircle className="mr-2 inline-block text-red-500" /> An error
            occurred: {err}
          </>
        )
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (isLogin) {
      await handleLogin(data as LoginFormValues);
    } else {
      await handleRegister(data as RegisterFormValues);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isLogin ? 'Login' : 'Create an account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin
            ? 'Enter your username and password'
            : 'Enter your email below to create your account'}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your username..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isLogin && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="w-full" type="submit">
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <span
          className="ml-1 cursor-pointer text-blue-500"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Register' : 'Login'}
        </span>
      </p>
    </div>
  );
}
