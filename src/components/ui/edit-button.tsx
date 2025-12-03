"use client"

import Link from 'next/link'
import { Edit } from 'lucide-react'

interface EditButtonProps {
  href: string
  label?: string
}

export function EditButton({ href, label = "Edit" }: EditButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-2 py-1 rounded-md text-sm border border-gray-200 hover:bg-gray-100"
    >
      <Edit className="h-4 w-4 mr-1" />
      {label}
    </Link>
  )
}