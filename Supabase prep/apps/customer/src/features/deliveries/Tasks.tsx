import { useEffect, useState } from 'react';
import { supabase } from '@swiftroute/core';

type Task = {
	id: number;
	title: string;
	completed: boolean;
};

export default function Tasks() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchTasks() {
			const { data, error } = await supabase
				.from('tasks')
				.select('*')
				.order('id');

			if (error) {
				setError(error.message);
				return;
			}

			setTasks(data ?? []);
		}

		fetchTasks();
	}, []);

	if (error) return <p>Error: {error}</p>;

	return (
		<ul>
			{tasks.map((task) => (
				<li key={task.id}>
					{task.title} — {task.completed ? 'Done' : 'Pending'}
				</li>
			))}
		</ul>
	);
}
