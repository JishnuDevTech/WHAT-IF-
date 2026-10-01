import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

export default function AnimatedNumber({ value }) {
  const mv = useMotionValue(value)
  const rounded = useTransform(mv, (v) => Math.round(v))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.45, ease: 'easeOut' })
    return controls.stop
  }, [value, mv])
  return <motion.span>{rounded}</motion.span>
}
