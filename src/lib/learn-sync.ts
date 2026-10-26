import * as React from "react"

import type { PersonId } from "@/data/types"
import { canonical, EMPTY_STORE, mergeStores, setStoreOf, storeOf } from "@/lib/learn"
import { useVault } from "@/lib/vault/vault"

/**
 * Mantém o progresso de `me` igual no aparelho e no cofre. Sempre que o cofre muda, junta o que
 * veio de lá com o do aparelho. Fora de uma lição (`active`), envia pro cofre o que ele ainda não tem;
 * durante a lição espera, pra não salvar a cada resposta.
 */
export function useLearnSync(me: PersonId, active: boolean) {
  const { doc, update, saving } = useVault()

  React.useEffect(() => {
    if (!doc) return
    const remote = doc.learn?.[me]
    const local = storeOf(me)
    const merged = mergeStores(local, remote)
    if (canonical(merged) !== canonical(local)) setStoreOf(me, merged)
    if (!active || saving || canonical(merged) === canonical(remote ?? EMPTY_STORE)) return
    void update((d) => {
      d.learn = { ...d.learn, [me]: mergeStores(storeOf(me), d.learn?.[me]) }
    })
  }, [doc, me, active, saving, update])
}
