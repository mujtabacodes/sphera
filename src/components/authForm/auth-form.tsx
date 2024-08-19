'use client';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaRegUser } from 'react-icons/fa';
import { Button } from '../ui/button';
import { useFormik } from 'formik';
import { Checkbox } from '../ui/checkbox';
import Link from 'next/link';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import showToast from '../toaster/toast';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const Navigate=useRouter()
  const sigupInitialValues = {
    name: '',
    email: '',
    password: '',
    phone: '',
  };
  const singinInitialValues = {
    email: '',
    password: '',
  };

  const signupMutation = useMutation({
    mutationFn: (formData: typeof sigupInitialValues) => {
      return axios.post(
        `/api/user/signup`,
        formData,
      );
    },
    onSuccess: (res:any) => {
      if (res.data.status == 409) {
        showToast('warn', res.data.message + '!');
      } else {
        Sigup.resetForm();
        showToast('success', 'Account created Successfully🎉');
      }
    },
    onError: (error: any) => {
      showToast('error', 'Ensure name, email and password filled.');
      console.error('Error signing up:', error);
    },
  });

  const signinMutation = useMutation({
    mutationFn: (formData: typeof singinInitialValues) => {
      return axios.post(
        `/api/user/login`,
        formData,
        { withCredentials: true },
      );
    },
    onSuccess: (res:any) => {
      if (res.data.status == 403) {
        showToast('warn', res.data.message + ' ☹');
      } else {
        Signin.resetForm();
        Navigate.push('/dashboard')
        showToast('success', `${res.data.message}🎉`);
      }
    },
    onError: (error: any) => {
      showToast('error', 'Make sure email and password is correct.');
      console.log(error);
    },
  });

  const Sigup = useFormik({
    initialValues: sigupInitialValues,
    onSubmit: (values) => {
      if (values.name === '' || values.password === '' || values.email === '') {
        showToast('warn', 'Ensure name, email and password filled.');
      } else {
        signupMutation.mutate(values);
      }
    },
  });

  const Signin = useFormik({
    initialValues: singinInitialValues,
    onSubmit: (values) => {
      if (values.password === '' || values.email === '') {
        showToast('warn', 'Email and Password is required!');
      } else {
        signinMutation.mutate(values);
      }
    },
  });

  return (
    <Tabs defaultValue="login" className="p-2">
      <TabsList className=" w-full text-center space-x-4  flex justify-center items-center">
        <TabsTrigger className="text-2xl font-bold " value="login">
          <FaRegUser />
          Sign in
        </TabsTrigger>
        <span className="h-10 border border-black" />
        <TabsTrigger className="text-2xl font-bold " value="register">
          <FaRegUser />
          Sign up
        </TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form onSubmit={Signin.handleSubmit} className="space-y-5 mt-10">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email"
            onChange={Signin.handleChange}
            value={Signin.values.email}
          />

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter Password"
            onChange={Signin.handleChange}
            value={Signin.values.password}
          />
          <div className="text-end pr-4">
            <Link href={'/forget'}>Forget Passowrd?</Link>
          </div>
          <Button
            type="submit"
            variant={'login'}
            disabled={signinMutation.isPending ? true : false}
            className="w-full h-[76px] "
          >
            {signinMutation.isPending ? (
              <div>loading...</div>
            ) : (
              'Login to Continue'
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register">
        <form onSubmit={Sigup.handleSubmit} className="space-y-5 mt-10">
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter Name"
            onChange={Sigup.handleChange}
            value={Sigup.values.name}
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email"
            onChange={Sigup.handleChange}
            value={Sigup.values.email}
          />
          <Input
            id="phone"
            name="phone"
            type="phone"
            placeholder="Enter Phone Number"
            onChange={Sigup.handleChange}
            value={Sigup.values.phone}
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter Password"
            onChange={Sigup.handleChange}
            value={Sigup.values.password}
          />
          <div className="flex items-center space-x-2 px-9">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
          </div>
          <Button
            type="submit"
            variant={'login'}
            disabled={signupMutation.isPending ? true : false}
            className="w-full h-[76px] "
          >
            {signupMutation.isPending ? (
              <div>loading...</div>
            ) : (
              'Signup to Continue'
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
