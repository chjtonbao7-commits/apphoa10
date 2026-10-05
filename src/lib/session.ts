import { useEffect, useState } from 'react'

export type Student = { id: number; name: string; className: string }

const KEY = 'schrodinger-student'

export function saveStudent(s: Student) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function clearStudent() {
  localStorage.removeItem(KEY)
}

/** Returns the logged-in student (undefined while reading storage, null when logged out). */
export function useStudent() {
  const [student, setStudent] = useState<Student | null | undefined>(undefined)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      setStudent(raw ? (JSON.parse(raw) as Student) : null)
    } catch {
      setStudent(null)
    }
  }, [])
  return student
}
