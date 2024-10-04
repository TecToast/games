import { useWizardConnection } from "~/composables/wizard/useWizardConnection";
import { watchMessage } from "~/utils/wsutils";

export function useWizardNumbers(
  firstCome: Ref<string>,
  playerName: Ref<string>,
) {
  const { data, sendWS } = useWizardConnection();
  const stitchGoals = ref<{ [name: string]: number }>({});
  const stitchDone = ref<{ [name: string]: number }>({});
  const hasPredicted = ref<string[]>([]);
  const results = ref<{ [name: string]: number }>({});
  watchMessage(data, "StitchGoal", (d) => {
    stitchGoals.value[d.name] = d.goal;
    if (d.name == playerName.value) {
      firstCome.value = "";
    }
  });
  watchMessage(data, "UpdateDoneStitches", (d) => {
    stitchDone.value[d.player] = d.amount;
  });
  watchMessage(data, "HasPredicted", (d) => {
    hasPredicted.value.push(d.name);
  });
  watchMessage(data, "Results", (d) => {
    results.value = d.results;
  });
  const stitchesPredicted = ref(0);

  function saveStitches() {
    sendWS("StitchGoal", { goal: stitchesPredicted.value });
  }
  function stitchReset() {
    stitchGoals.value = {};
    stitchDone.value = {};
    hasPredicted.value = [];
    results.value = {};
    stitchesPredicted.value = 0;
  }
  return {
    stitchGoals,
    stitchDone,
    hasPredicted,
    results,
    stitchesPredicted,
    saveStitches,
    stitchReset,
  };
}
