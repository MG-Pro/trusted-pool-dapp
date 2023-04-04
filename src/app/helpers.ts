export class Helpers {
  public static splitParticipants<T = unknown>(participants: T[], size: number): T[][] {
    const pChunks: T[][] = []
    for (let k = 0; k < participants.length; k += size) {
      const chunk = participants.slice(k, k + size)
      pChunks.push(chunk)
    }
    return pChunks
  }
}
