let mockActivators = []

export const setMockActivators = activators => {
  mockActivators = activators
}

export default function scanActivators() {
  return mockActivators || []
}
