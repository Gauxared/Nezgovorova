import { useState } from "react";
import { CrudPage } from "./CrudPage";
import { referenceConfigs } from "./resourceConfigs";

export function ReferencesPage({ token }: { token: string | null }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="tabs">
        {referenceConfigs.map((config, index) => (
          <button key={config.endpoint} className={index === activeIndex ? "active-tab" : ""} type="button" onClick={() => setActiveIndex(index)}>
            {config.title}
          </button>
        ))}
      </div>
      <CrudPage config={referenceConfigs[activeIndex]} token={token} />
    </div>
  );
}
