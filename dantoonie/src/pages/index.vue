<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { ref } from "vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "vue-router";
import { $user } from "../store/user";

const router = useRouter()
const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(1),
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: 'johndoe@example.com',
    password: 'B0ssman69',
  }
})

const fetchError = ref(false)

const submit = form.handleSubmit(async (values) => {
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      fetchError.value = true
      setTimeout(() => {
        fetchError.value = true
      }, 10_000)
      return
    }

    const body = await response.json();

    $user.set(body);
    await router.push('/dashboard')
  } catch (err) {
    fetchError.value = true
    setTimeout(() => {
      fetchError.value = true
    }, 10_000)
  }
});

</script>

<template>
  <h1 class="text-xl font-extrabold tracking-tight">Login to your account</h1>
  <form class="lg:w-1/3 sm:w-2/3 space-y-2" @submit="submit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel for="username">Username</FormLabel>
        <FormControl>
          <Input id="username" name="username" type="text" v-bind="componentField"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel for="password">Password</FormLabel>
        <FormControl>
          <Input id="password" name="password" type="password" v-bind="componentField"/>
        </FormControl>
        <FormMessage/>
      </FormItem>
      <Button type="submit">Login</Button>
    </FormField>
  </form>
  <div class="pt-4">
    <Alert v-show="fetchError" variant="destructive">
      <AlertTitle>Oh, no!</AlertTitle>
      <AlertDescription>
        There was an error logging in. Please try again.
      </AlertDescription>
    </Alert>
  </div>
</template>

<style scoped>

</style>