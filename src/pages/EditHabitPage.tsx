import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HabitForm from '../components/HabitForm'
import type { HabitFormValues } from '../components/HabitForm'

export default function EditHabitPage() {
  const { id } = useParams<{ id: string }>()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const habit = state.habits.find((h) => h.id === id)

  if (!habit) {
    return (
      <div className="px-4 pt-12 text-center ">
        Habit not found.
      </div>
    )
  }

  function handleSubmit(values: HabitFormValues) {
    dispatch({ type: 'EDIT_HABIT', payload: { id: habit!.id, ...values } })
    navigate(`/habits/${habit!.id}`)
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white -ml-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Edit Habit</h1>
      </div>
      <HabitForm
        initial={{ name: habit.name, icon: habit.icon, color: habit.color }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  )
}
