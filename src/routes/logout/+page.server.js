
import { redirect } from '@sveltejs/kit';
export const load = async ({ cookies }) => {
    cookies.delete('user_id', { path: '/' });
    throw redirect(303, '/login');
};